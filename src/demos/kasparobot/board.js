/**
 * Chess-side state: what is on the board, and how detections become a FEN.
 *
 * This is the port of square_map_to_fen and map_detections_to_squares from
 * core/ChessBoard.py and core/detection/map_pieces_to_board.py.
 */

/**
 * CLASS_TO_PIECE from ChessBoard.py. The detector emits a class index and the
 * FEN encoder needs a letter, so this table is the join between the two halves
 * of the system. Lowercase is black, uppercase white, matching FEN.
 */
export const CLASS_TO_PIECE = {
  0: '?', 1: 'b', 2: 'k', 3: 'n', 4: 'p', 5: 'q', 6: 'r',
  7: 'B', 8: 'K', 9: 'N', 10: 'P', 11: 'Q', 12: 'R',
}

const PIECE_TO_CLASS = Object.fromEntries(
  Object.entries(CLASS_TO_PIECE).map(([id, letter]) => [letter, Number(id)]),
)

/**
 * How tall each piece stands, in multiples of one square's width.
 *
 * Only used to size the detection boxes. A king's box is nearly twice a pawn's,
 * and that difference is the entire reason the pipeline anchors on the bottom
 * edge of a box rather than its middle -- see anchorFor().
 */
export const PIECE_HEIGHTS = {
  p: 1.05, r: 1.2, n: 1.35, b: 1.45, q: 1.7, k: 1.95,
}

export const PIECE_NAMES = {
  p: 'Pawn', r: 'Rook', n: 'Knight', b: 'Bishop', q: 'Queen', k: 'King',
}

/**
 * Piece glyphs, keyed by type rather than colour.
 *
 * Only the solid variants are used, for both sides. The hollow outline glyphs
 * (U+2654..U+2659) are drawn as thin strokes, which all but disappear on a
 * light square; colouring the solid shape and outlining it stays legible on
 * either square colour.
 */
export const PIECE_GLYPHS = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
}

/** 'e4' -> { file: 4, rank: 4 } with file 0-7 from the a-file. */
export function parseSquare(square) {
  return { file: square.charCodeAt(0) - 97, rank: Number(square[1]) }
}

export function squareName(file, rank) {
  return String.fromCharCode(97 + file) + rank
}

/** Light squares are those where file + rank is even (a1 is dark). */
export function isLightSquare(file, rank) {
  return (file + rank) % 2 === 0
}

/** Expand the placement field of a FEN into a { square: letter } map. */
export function fenToPieces(fen) {
  const pieces = {}
  const rows = fen.split(' ')[0].split('/')
  rows.forEach((row, index) => {
    const rank = 8 - index
    let file = 0
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') file += Number(ch)
      else {
        pieces[squareName(file, rank)] = ch
        file += 1
      }
    }
  })
  return pieces
}

/**
 * square_map_to_fen: a { square: classId } map back to a FEN placement field.
 *
 * Walks rank 8 down to rank 1, a-file to h-file, collapsing runs of empty
 * squares into a count -- which is all a FEN placement field is.
 */
export function squareMapToFen(squareMap) {
  const rows = []
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = ''
    let empty = 0
    for (let file = 0; file < 8; file += 1) {
      const classId = squareMap[squareName(file, rank)]
      if (classId === undefined) {
        empty += 1
        continue
      }
      if (empty > 0) {
        row += String(empty)
        empty = 0
      }
      row += CLASS_TO_PIECE[classId]
    }
    if (empty > 0) row += String(empty)
    rows.push(row)
  }
  return rows.join('/')
}

/**
 * Where on a detection box the pipeline decides the piece is standing.
 *
 * A chess piece is a tall object photographed from an angle, so the middle of
 * its bounding box floats somewhere above the board -- project that and you get
 * the square *behind* the one the piece is on, and the taller the piece the
 * worse the error. The bottom edge is where the piece actually meets the board,
 * which is the only point that reliably lies on the plane the homography maps.
 *
 * The Python takes `cy + h/2` unconditionally; 'centre' exists here so the demo
 * can show what that decision is worth.
 */
export function anchorFor(box, mode) {
  return mode === 'centre' ? [box.cx, box.cy] : [box.cx, box.cy + box.height / 2]
}

/**
 * map_detections_to_squares: image-space anchors to algebraic squares.
 *
 * `H` maps image pixels into board units, where the playing surface is 0..8 on
 * both axes with the origin at the a8 corner. Flooring a board-unit coordinate
 * therefore gives a column and row index directly, and `orientation` decides
 * how those indices are read as a file and a rank -- the same four cases the
 * Python supports, for a camera mounted on any side of the board.
 *
 * Anything landing outside 0..7 is dropped: a piece standing beside the board,
 * or a false positive on the table, should not silently become a real square.
 */
export function mapDetectionsToSquares(detections, H, applyH, { orientation = 0, anchorMode = 'bottom' } = {}) {
  const squareMap = {}
  const placements = []

  for (const detection of detections) {
    const anchor = anchorFor(detection, anchorMode)
    const [bx, by] = applyH(H, anchor)
    const col = Math.floor(bx)
    const row = Math.floor(by)

    if (col < 0 || col > 7 || row < 0 || row > 7) {
      placements.push({ detection, anchor, square: null, outOfBounds: true })
      continue
    }

    let file
    let rank
    switch (orientation) {
      case 90:  file = row;     rank = col + 1; break
      case 180: file = 7 - col; rank = row + 1; break
      case 270: file = 7 - row; rank = 8 - col; break
      default:  file = col;     rank = 8 - row
    }

    const square = squareName(file, rank)
    squareMap[square] = detection.classId
    placements.push({ detection, anchor, square, outOfBounds: false })
  }

  return { squareMap, placements }
}

/**
 * The inverse of the orientation switch above: an algebraic square back to the
 * (column, row) cell it occupies on the rectified board.
 *
 * Needed to place the detection boxes. Each frame declares the orientation its
 * camera actually sits at, boxes are laid out through that, and the mapping
 * above then reads them back through whichever orientation is selected -- so
 * picking the wrong one produces a genuinely wrong FEN rather than a staged one.
 */
export function boardCellFor(file, rank, orientation) {
  switch (orientation) {
    case 90:  return [rank - 1, file]
    case 180: return [7 - file, rank - 1]
    case 270: return [8 - rank, 7 - file]
    default:  return [file, 8 - rank]
  }
}

/** Detector-style records for a position, as { square, letter, classId }. */
export function detectionsForFen(fen) {
  return Object.entries(fenToPieces(fen)).map(([square, letter]) => ({
    square,
    letter,
    classId: PIECE_TO_CLASS[letter],
  }))
}

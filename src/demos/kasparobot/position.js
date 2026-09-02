/**
 * Turning a square map into something a chess engine will accept.
 *
 * The vision half of the pipeline produces "there is a white rook on a1". An
 * engine wants a FEN, which additionally asserts whose turn it is, what may
 * still castle, and whether an en-passant capture is available -- none of which
 * is visible in a photograph of a board.
 *
 * So those are inferred where they can be and left empty where they cannot,
 * and `describeIllegal` explains the cases where the result is a position no
 * game could have reached.
 */

import { squareName } from './board.js'

/**
 * Castling rights, guessed from where the kings and rooks are standing.
 *
 * A photo cannot show whether a king has already moved and come back, so this
 * is the same optimistic assumption every position editor makes: pieces on
 * their home squares are assumed never to have left them.
 */
function inferCastling(pieces) {
  let rights = ''
  if (pieces.e1 === 'K') {
    if (pieces.h1 === 'R') rights += 'K'
    if (pieces.a1 === 'R') rights += 'Q'
  }
  if (pieces.e8 === 'k') {
    if (pieces.h8 === 'r') rights += 'k'
    if (pieces.a8 === 'r') rights += 'q'
  }
  return rights || '-'
}

/** { square: letter } to a full six-field FEN. */
export function piecesToFen(pieces, sideToMove = 'w') {
  const rows = []
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = ''
    let empty = 0
    for (let file = 0; file < 8; file += 1) {
      const piece = pieces[squareName(file, rank)]
      if (!piece) {
        empty += 1
        continue
      }
      if (empty) {
        row += String(empty)
        empty = 0
      }
      row += piece
    }
    if (empty) row += String(empty)
    rows.push(row)
  }
  return `${rows.join('/')} ${sideToMove} ${inferCastling(pieces)} - 0 1`
}

/** The placement field alone, for comparing two positions. */
export function placementOf(fen) {
  return fen.split(' ')[0]
}

/**
 * Why this position cannot be played, in words a visitor can act on.
 *
 * Worth doing properly because the automatic reader produces illegal positions
 * routinely -- it cannot tell a king from a bishop, so it calls everything a
 * pawn. "Invalid FEN: missing white king" is true but useless; naming the fix
 * is what makes the editor next to it feel like the answer.
 */
export function describeIllegal(pieces) {
  const values = Object.values(pieces)
  const whiteKings = values.filter((p) => p === 'K').length
  const blackKings = values.filter((p) => p === 'k').length

  if (whiteKings === 0 && blackKings === 0) {
    return 'No kings on the board. A position needs exactly one of each to be playable — set them with the piece palette.'
  }
  if (whiteKings === 0) return 'No white king. Place one to make this playable.'
  if (blackKings === 0) return 'No black king. Place one to make this playable.'
  if (whiteKings > 1) return `${whiteKings} white kings. A position may only have one.`
  if (blackKings > 1) return `${blackKings} black kings. A position may only have one.`

  const backRankPawns = Object.entries(pieces).filter(
    ([square, piece]) => (piece === 'P' || piece === 'p') && (square[1] === '1' || square[1] === '8'),
  )
  if (backRankPawns.length) {
    return `Pawns cannot stand on rank 1 or 8 (${backRankPawns.map(([s]) => s).join(', ')}). The reader guesses "pawn" for everything it finds, so back-rank pieces usually need correcting.`
  }
  return null
}

/** Piece letters offered by the editor, in a sensible palette order. */
export const PALETTE = [
  ['K', 'Q', 'R', 'B', 'N', 'P'],
  ['k', 'q', 'r', 'b', 'n', 'p'],
]

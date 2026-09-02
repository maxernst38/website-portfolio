/**
 * The reference frames the demo can run on.
 *
 * Each entry is one photograph plus everything that is specific to it: where
 * the playing surface sits, which way round the camera is, what is actually on
 * the board, and what the engine said about that position.
 *
 * `corners` are the four playing-surface corners in visual order -- top-left,
 * top-right, bottom-right, bottom-left of the board as it appears -- stored as
 * fractions of the frame so they hold at any processing resolution. They were
 * fitted, not measured by eye: the ideal 9x9 lattice was matched against the
 * intersections this pipeline detects and refined until it stopped moving. The
 * residual quoted on each frame is the mean distance from a fitted lattice
 * corner to the detection it matched, at 500px wide.
 *
 * Adding a frame means refitting those corners. A photograph dropped in without
 * that will render, and the grid will be wrong.
 */

import obliqueUrl from '../../assets/images/kasparobot-oblique.jpg'
import overheadUrl from '../../assets/images/kasparobot-overhead.jpg'
import wideUrl from '../../assets/images/kasparobot-wide.jpg'

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/**
 * Stockfish 17.1 at the depth ChessBoard.py configures.
 *
 * Recorded from real runs rather than computed here -- the engine is a native
 * binary and this page is static. Reproduce either with `position fen <fen>`
 * followed by `go depth 20`.
 */
const AFTER_E4_REPLY = {
  engine: 'Stockfish 17.1', depth: 20,
  bestMove: 'e7e5', san: 'e5', scoreCp: -26, mover: 'Black',
}

const OPENING_MOVE = {
  engine: 'Stockfish 17.1', depth: 20,
  bestMove: 'e2e4', san: 'e4', scoreCp: 35, mover: 'White',
}

export const FRAMES = [
  {
    id: 'oblique',
    label: 'Oblique',
    blurb: 'A camera off to one side and above, which is the view the robot actually gets.',
    image: obliqueUrl,
    corners: [
      [0.19422, 0.20103], [0.79818, 0.20400],
      [0.84036, 0.85864], [0.15306, 0.86021],
    ],
    fitResidual: 1.12,
    orientation: 0,
    // The one position here that is not a set-up board. The advanced e-pawn is
    // what proves the geometry resolved rather than merely looking plausible.
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    caption: 'After 1. e4',
    engine: AFTER_E4_REPLY,
    offBoard: [],
  },
  {
    id: 'overhead',
    label: 'Overhead',
    blurb:
      'Straight down. The homography has almost nothing left to undo, so this is the case that shows what rectification is aiming at.',
    image: overheadUrl,
    corners: [
      [0.16027, 0.15806], [0.84455, 0.15784],
      [0.84689, 0.84201], [0.16059, 0.84312],
    ],
    fitResidual: 1.97,
    orientation: 0,
    fen: START,
    caption: 'Starting position',
    engine: OPENING_MOVE,
    offBoard: [],
  },
  {
    id: 'wide',
    label: 'Spare pieces',
    blurb:
      'Two spare queens sit on the table beside the board — the case the square lookup has to throw away rather than round onto a real square.',
    image: wideUrl,
    corners: [
      [0.20323, 0.13276], [0.79678, 0.14235],
      [0.83422, 0.88211], [0.16879, 0.87927],
    ],
    fitResidual: 3.08,
    orientation: 0,
    fen: START,
    caption: 'Starting position, two spare queens beside the board',
    engine: OPENING_MOVE,
    // Positioned by where each queen meets the table, as a fraction of the
    // frame. They are genuinely in the photograph; the point of carrying them
    // is that they land outside 0..8 and must be rejected.
    offBoard: [
      { letter: 'q', at: [0.086, 0.442] },
      { letter: 'Q', at: [0.082, 0.585] },
    ],
  },
]

export function getFrame(id) {
  return FRAMES.find((frame) => frame.id === id) ?? FRAMES[0]
}

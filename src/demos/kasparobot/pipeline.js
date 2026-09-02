/**
 * Runs detect_board.py's chain end to end and keeps every intermediate buffer.
 *
 * A normal port would return only the homography. This one hands back the mask,
 * the edges, the two line families and the merged intersections as well,
 * because the demo renders each stage and the whole point is being able to see
 * where a bad result came from.
 */

import {
  rgbToHsv, inRange, morphOpen, morphClose, canny,
  houghLines, classifyLines, lineIntersection, mergeNearbyPoints,
} from './cv.js'
import { computeHomography, applyHomography, invert3x3 } from './geometry.js'
import { CLASS_TO_PIECE, PIECE_HEIGHTS, boardCellFor, parseSquare } from './board.js'

const PIECE_TO_CLASS = Object.fromEntries(
  Object.entries(CLASS_TO_PIECE).map(([id, letter]) => [letter, Number(id)]),
)

/** The HSV window from create_mask, tuned for the rig's green playing mat. */
export const GREEN_MAT_RANGE = { lower: [50, 40, 40], upper: [90, 255, 200] }

/**
 * The same threshold retuned for the wooden board in the photograph.
 *
 * The green constants return an empty mask here, which is not a bug in either
 * the code or the photo -- an HSV window is a statement about one particular
 * board under one particular light. Re-fitting it is the actual work of
 * pointing this pipeline at a new setup, so the demo lets you do it.
 */
export const DEFAULT_RANGE = { lower: [5, 70, 40], upper: [25, 255, 190] }

export const DEFAULTS = {
  ...DEFAULT_RANGE,
  cannyLow: 50,
  cannyHigh: 150,
  houghThreshold: 100,
  clusterEps: 25,
}

/** Board-unit corners: the playing surface is 0..8, origin at the quad's first corner. */
const BOARD_UNITS = [[0, 0], [8, 0], [8, 8], [0, 8]]

/**
 * The transforms between one frame's pixels and board units.
 *
 * `corners` come from the frame descriptor as fractions, so this works at any
 * processing resolution. See frames.js for how they were fitted.
 */
export function boardHomographies(width, height, corners) {
  const imageCorners = corners.map(([fx, fy]) => [fx * width, fy * height])
  const boardToImage = computeHomography(BOARD_UNITS, imageCorners)
  return { boardToImage, imageToBoard: invert3x3(boardToImage), imageCorners }
}

/** Everything up to and including the merged grid intersections. */
export function runDetection(rgba, width, height, params = DEFAULTS) {
  const hsv = rgbToHsv(rgba, width, height)

  const raw = inRange(hsv, width, height, params.lower, params.upper)
  const mask = morphClose(morphOpen(raw, width, height), width, height)

  let maskCoverage = 0
  for (const value of mask) if (value) maskCoverage += 1
  maskCoverage /= mask.length

  const edges = canny(mask, width, height, params.cannyLow, params.cannyHigh)
  let edgeCount = 0
  for (const value of edges) if (value) edgeCount += 1

  const lines = houghLines(edges, width, height, params.houghThreshold)
  const { horizontal, vertical } = classifyLines(lines)

  // Intersections outside the frame are lines meeting somewhere off-camera and
  // are never board corners, so they are dropped before clustering.
  const margin = 40
  const candidates = []
  for (const h of horizontal) {
    for (const v of vertical) {
      const point = lineIntersection(h, v)
      if (!point) continue
      if (point[0] < -margin || point[0] > width + margin) continue
      if (point[1] < -margin || point[1] > height + margin) continue
      candidates.push(point)
    }
  }
  const intersections = mergeNearbyPoints(candidates, params.clusterEps)

  return {
    mask, maskCoverage, edges, edgeCount,
    lines, horizontal, vertical,
    rawIntersections: candidates.length, intersections,
  }
}

/**
 * Detection boxes for the pieces in a frame.
 *
 * YOLO is a PyTorch model and cannot run on a static page, so the boxes are
 * placed from the known position instead: each piece's base is its square's
 * centre through the homography, and the box is grown upward from there by the
 * piece's height. Every stage after this one -- anchoring, the square lookup,
 * the FEN -- then runs for real on these boxes.
 *
 * Placement goes through the frame's own orientation, so reading them back at a
 * different one genuinely misreads the board instead of being staged to fail.
 *
 * `offBoard` covers pieces sitting on the table beside the board. They are
 * given directly in frame fractions, because there is no square to derive them
 * from -- which is the entire point of carrying them.
 *
 * The upward direction is taken as image-up rather than a true vertical
 * vanishing point. For a camera looking down at a board that is a sub-pixel
 * simplification, and the box only ever needs to be plausible: nothing
 * downstream reads its top edge.
 */
export function buildDetectionBoxes(
  { boardToImage, imageToBoard },
  detections,
  { orientation = 0, offBoard = [], width = 0, height = 0 } = {},
) {
  // Square width in pixels *at this spot*, so boxes shrink correctly with depth.
  const scaleAt = ([bx, by]) => {
    const left = applyHomography(boardToImage, [bx - 0.5, by])
    const right = applyHomography(boardToImage, [bx + 0.5, by])
    return Math.hypot(right[0] - left[0], right[1] - left[1])
  }

  // How steeply the camera looks at the board, read off the homography: compare
  // a step across the board with a step into it at the centre. Equal means
  // straight down; a short depth step means a shallow, oblique view.
  const across = scaleAt([4, 4])
  const near = applyHomography(boardToImage, [4, 3.5])
  const far = applyHomography(boardToImage, [4, 4.5])
  const depthRatio = Math.min(1, Math.max(0.05, Math.hypot(far[0] - near[0], far[1] - near[1]) / across))

  // A standing piece projects to cos(elevation) of its height, and the depth
  // axis compresses by sin(elevation) -- so the same piece that towers up the
  // frame in an oblique shot is only its own footprint from overhead. Getting
  // this wrong would make the anchor comparison lie: the bottom edge and the
  // centre of a circular blob are nearly the same point, and the demo would
  // claim an error that the geometry does not actually produce.
  const standing = Math.sqrt(Math.max(0, 1 - depthRatio * depthRatio))

  const boxFor = (letter, base, squarePx, extra) => {
    const footprint = 0.7 * depthRatio
    const boxHeight = squarePx * (PIECE_HEIGHTS[letter.toLowerCase()] * standing + footprint)
    // The box bottom is the near edge of the piece's base, not its centre.
    const bottom = base[1] + 0.35 * squarePx * depthRatio
    return {
      ...extra,
      letter,
      cx: base[0],
      cy: bottom - boxHeight / 2,
      width: 0.72 * squarePx,
      height: boxHeight,
      base,
    }
  }

  const boxes = detections.map((detection) => {
    const { file, rank } = parseSquare(detection.square)
    const [col, row] = boardCellFor(file, rank, orientation)
    const cell = [col + 0.5, row + 0.5]
    return boxFor(detection.letter, applyHomography(boardToImage, cell), scaleAt(cell), detection)
  })

  for (const piece of offBoard) {
    const base = [piece.at[0] * width, piece.at[1] * height]
    const cell = applyHomography(imageToBoard, base)
    boxes.push(
      boxFor(piece.letter, base, scaleAt(cell), {
        square: null,
        offBoard: true,
        classId: PIECE_TO_CLASS[piece.letter],
      }),
    )
  }

  return boxes
}

/**
 * warpPerspective: the oblique frame resampled into a square top-down board.
 *
 * Inverse mapping with bilinear sampling -- for each destination pixel, find
 * where it came from in the source. Going forwards instead would leave holes
 * wherever the source stretches.
 */
export function warpToBoard(rgba, width, height, imageToBoard, size) {
  const boardToImage = invert3x3(imageToBoard)
  const out = new Uint8ClampedArray(size * size * 4)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [sx, sy] = applyHomography(boardToImage, [(x / size) * 8, (y / size) * 8])
      const o = (y * size + x) * 4

      if (sx < 0 || sx >= width - 1 || sy < 0 || sy >= height - 1) {
        out[o] = out[o + 1] = out[o + 2] = 244
        out[o + 3] = 255
        continue
      }

      const x0 = Math.floor(sx)
      const y0 = Math.floor(sy)
      const fx = sx - x0
      const fy = sy - y0

      for (let c = 0; c < 3; c += 1) {
        const p00 = rgba[(y0 * width + x0) * 4 + c]
        const p10 = rgba[(y0 * width + x0 + 1) * 4 + c]
        const p01 = rgba[((y0 + 1) * width + x0) * 4 + c]
        const p11 = rgba[((y0 + 1) * width + x0 + 1) * 4 + c]
        out[o + c] =
          p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) +
          p01 * (1 - fx) * fy + p11 * fx * fy
      }
      out[o + 3] = 255
    }
  }
  return out
}

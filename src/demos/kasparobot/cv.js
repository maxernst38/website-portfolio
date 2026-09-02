/**
 * The OpenCV half of core/detection/detect_board.py, reimplemented for canvas.
 *
 * create_mask -> find_intersections is a chain of five operations: an HSV
 * threshold, a morphological open/close, Canny, a Hough transform, and a
 * clustering pass over the line intersections. Each one is a separate export
 * here so the demo can render the intermediate buffer after every step, which
 * is the whole point of the visualisation.
 *
 * Conventions follow OpenCV rather than the web, because the Python is the
 * reference: hue is 0..179 (not 0..359), saturation and value are 0..255, and
 * masks are 0 or 255 in a flat Uint8Array of width*height.
 */

/** Packed HSV, three bytes per pixel, in OpenCV's ranges. */
export function rgbToHsv(rgba, width, height) {
  const hsv = new Uint8ClampedArray(width * height * 3)
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    const r = rgba[i] / 255
    const g = rgba[i + 1] / 255
    const b = rgba[i + 2] / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min

    let h = 0
    if (delta > 1e-9) {
      if (max === r) h = 60 * (((g - b) / delta) % 6)
      else if (max === g) h = 60 * ((b - r) / delta + 2)
      else h = 60 * ((r - g) / delta + 4)
      if (h < 0) h += 360
    }

    hsv[j] = h / 2 // OpenCV packs hue into a byte by halving degrees.
    hsv[j + 1] = max > 1e-9 ? (delta / max) * 255 : 0
    hsv[j + 2] = max * 255
  }
  return hsv
}

/** cv2.inRange: 255 where every channel falls inside its bounds, else 0. */
export function inRange(hsv, width, height, lower, upper) {
  const mask = new Uint8Array(width * height)
  for (let p = 0, j = 0; p < mask.length; p += 1, j += 3) {
    mask[p] =
      hsv[j] >= lower[0] && hsv[j] <= upper[0] &&
      hsv[j + 1] >= lower[1] && hsv[j + 1] <= upper[1] &&
      hsv[j + 2] >= lower[2] && hsv[j + 2] <= upper[2]
        ? 255
        : 0
  }
  return mask
}

/**
 * 3x3 erode/dilate. Open (erode then dilate) drops speckle; close (dilate then
 * erode) fills pinholes. The Python runs one of each, in that order.
 *
 * Border pixels are treated as background, which matches cv2's default
 * BORDER_CONSTANT for morphology and keeps the frame edge from dilating inward.
 */
function morph(mask, width, height, dilate) {
  const out = new Uint8Array(width * height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let hit = dilate ? 0 : 255
      for (let dy = -1; dy <= 1 && (dilate ? !hit : hit); dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx
          const ny = y + dy
          const inside = nx >= 0 && nx < width && ny >= 0 && ny < height
          const value = inside ? mask[ny * width + nx] : 0
          if (dilate) {
            if (value) { hit = 255; break }
          } else if (!value) { hit = 0; break }
        }
      }
      out[y * width + x] = hit
    }
  }
  return out
}

export function morphOpen(mask, width, height) {
  return morph(morph(mask, width, height, false), width, height, true)
}

export function morphClose(mask, width, height) {
  return morph(morph(mask, width, height, true), width, height, false)
}

/**
 * cv2.Canny with apertureSize=3.
 *
 * Note there is no Gaussian blur here, matching OpenCV: Canny sobels whatever
 * you hand it. The Python feeds it a cleaned binary mask, so the edges are
 * already crisp and a blur would only round the corners the grid needs.
 *
 * Gradient magnitude is |gx| + |gy| rather than the Euclidean norm, which is
 * OpenCV's default (L2gradient=False) and shifts what the thresholds mean.
 */
export function canny(mask, width, height, lowThreshold, highThreshold) {
  const mag = new Float32Array(width * height)
  const dir = new Uint8Array(width * height)

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x
      const tl = mask[i - width - 1], tc = mask[i - width], tr = mask[i - width + 1]
      const ml = mask[i - 1],                                mr = mask[i + 1]
      const bl = mask[i + width - 1], bc = mask[i + width], br = mask[i + width + 1]

      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br

      mag[i] = Math.abs(gx) + Math.abs(gy)

      // Quantise the gradient to the four directions NMS can compare along.
      let angle = (Math.atan2(gy, gx) * 180) / Math.PI
      if (angle < 0) angle += 180
      if (angle < 22.5 || angle >= 157.5) dir[i] = 0
      else if (angle < 67.5) dir[i] = 1
      else if (angle < 112.5) dir[i] = 2
      else dir[i] = 3
    }
  }

  // Non-maximum suppression: keep a pixel only if it is a ridge crest along the
  // gradient direction, which is what thins a wide gradient to a 1px line.
  const thin = new Float32Array(width * height)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x
      let a
      let b
      switch (dir[i]) {
        case 0: a = mag[i - 1]; b = mag[i + 1]; break
        case 1: a = mag[i - width + 1]; b = mag[i + width - 1]; break
        case 2: a = mag[i - width]; b = mag[i + width]; break
        default: a = mag[i - width - 1]; b = mag[i + width + 1]
      }
      thin[i] = mag[i] >= a && mag[i] >= b ? mag[i] : 0
    }
  }

  // Hysteresis: strong pixels seed the output, weak ones survive only if they
  // are reachable from a strong one. Done as an explicit stack rather than
  // recursion so a long edge cannot blow the call stack.
  const edges = new Uint8Array(width * height)
  const stack = []
  for (let i = 0; i < thin.length; i += 1) {
    if (thin[i] >= highThreshold) {
      edges[i] = 255
      stack.push(i)
    }
  }
  while (stack.length) {
    const i = stack.pop()
    const x = i % width
    const y = (i / width) | 0
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const n = ny * width + nx
        if (!edges[n] && thin[n] >= lowThreshold) {
          edges[n] = 255
          stack.push(n)
        }
      }
    }
  }
  return edges
}

/**
 * cv2.HoughLines(edges, 1, pi/180, threshold).
 *
 * Every edge pixel votes for the family of lines through it, parameterised by
 * the normal (rho, theta). Peaks in that accumulator are lines in the image.
 * Returned strongest-first, like OpenCV, because the Python slices [:14] off
 * the front and depends on that ordering.
 */
export function houghLines(edges, width, height, threshold) {
  const numTheta = 180
  const diagonal = Math.ceil(Math.hypot(width, height))
  const numRho = 2 * diagonal + 1

  const cos = new Float32Array(numTheta)
  const sin = new Float32Array(numTheta)
  for (let t = 0; t < numTheta; t += 1) {
    const theta = (t * Math.PI) / numTheta
    cos[t] = Math.cos(theta)
    sin[t] = Math.sin(theta)
  }

  const acc = new Int32Array(numTheta * numRho)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!edges[y * width + x]) continue
      for (let t = 0; t < numTheta; t += 1) {
        const rho = Math.round(x * cos[t] + y * sin[t]) + diagonal
        acc[t * numRho + rho] += 1
      }
    }
  }

  // Suppress non-maxima in the accumulator. Without this a single strong line
  // returns as a dozen near-identical entries and the [:14] slice fills up with
  // copies of one board edge instead of fourteen different lines.
  const lines = []
  for (let t = 0; t < numTheta; t += 1) {
    for (let r = 1; r < numRho - 1; r += 1) {
      const votes = acc[t * numRho + r]
      if (votes < threshold) continue
      if (votes < acc[t * numRho + r - 1] || votes < acc[t * numRho + r + 1]) continue
      const prevTheta = ((t - 1 + numTheta) % numTheta) * numRho + r
      const nextTheta = ((t + 1) % numTheta) * numRho + r
      if (votes < acc[prevTheta] || votes < acc[nextTheta]) continue
      lines.push({ rho: r - diagonal, theta: (t * Math.PI) / numTheta, votes })
    }
  }

  lines.sort((a, b) => b.votes - a.votes)
  return lines
}

/**
 * Split lines into the two perpendicular families, by the angle of the normal.
 *
 * The Python's names read backwards — theta near 0 means a normal along x,
 * which is a *vertical* line — but it only ever intersects one bucket with the
 * other, so the labelling never affects the result. Kept as-is to stay
 * comparable with the source, and each family is capped at 14 like the original.
 */
export function classifyLines(lines, limit = 14) {
  const horizontal = []
  const vertical = []
  for (const line of lines) {
    const angle = ((line.theta * 180) / Math.PI) % 180
    if (angle > 80 && angle < 100) vertical.push(line)
    else if (angle < 10 || angle > 170) horizontal.push(line)
  }
  return { horizontal: horizontal.slice(0, limit), vertical: vertical.slice(0, limit) }
}

/** Where two (rho, theta) lines cross, or null if they are parallel. */
export function lineIntersection(a, b) {
  const det = Math.cos(a.theta) * Math.sin(b.theta) - Math.cos(b.theta) * Math.sin(a.theta)
  if (Math.abs(det) < 1e-9) return null
  return [
    (a.rho * Math.sin(b.theta) - b.rho * Math.sin(a.theta)) / det,
    (b.rho * Math.cos(a.theta) - a.rho * Math.cos(b.theta)) / det,
  ]
}

/**
 * The deduplicate_points step: DBSCAN at min_samples=1, then one centroid per
 * cluster.
 *
 * At min_samples=1 DBSCAN has no concept of noise, so it degenerates to
 * single-linkage clustering at distance eps -- which is union-find, and avoids
 * shipping a clustering library for one call.
 */
export function mergeNearbyPoints(points, eps) {
  if (points.length === 0) return []

  const parent = points.map((_, i) => i)
  const find = (i) => {
    let root = i
    while (parent[root] !== root) root = parent[root]
    while (parent[i] !== root) {
      const next = parent[i]
      parent[i] = root
      i = next
    }
    return root
  }

  const epsSquared = eps * eps
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[i][0] - points[j][0]
      const dy = points[i][1] - points[j][1]
      if (dx * dx + dy * dy <= epsSquared) {
        const a = find(i)
        const b = find(j)
        if (a !== b) parent[a] = b
      }
    }
  }

  const clusters = new Map()
  for (let i = 0; i < points.length; i += 1) {
    const root = find(i)
    if (!clusters.has(root)) clusters.set(root, [])
    clusters.get(root).push(points[i])
  }

  return [...clusters.values()].map((group) => [
    group.reduce((sum, p) => sum + p[0], 0) / group.length,
    group.reduce((sum, p) => sum + p[1], 0) / group.length,
  ])
}

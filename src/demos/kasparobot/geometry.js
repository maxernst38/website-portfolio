/**
 * The linear algebra Kasparobot leans on OpenCV for.
 *
 * The Python original calls cv2.findHomography and cv2.perspectiveTransform.
 * Neither exists in a browser, and pulling in a 9 MB opencv.js build to get two
 * functions would cost more than this whole demo. So they are implemented here:
 * a normalised DLT solve, a 3x3 inverse, and a point transform.
 *
 * Everything is plain arrays — no matrix library — because a 3x3 homography and
 * an 8x9 design matrix are small enough that the abstraction would be the
 * expensive part.
 */

/** Apply a 3x3 homography to a point, dividing through by w. */
export function applyHomography(H, [x, y]) {
  const w = H[6] * x + H[7] * y + H[8]
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]
}

/**
 * Hartley normalisation: translate the centroid to the origin and scale so the
 * mean distance from it is sqrt(2).
 *
 * Skipping this is the single most common way to get a bad homography. Raw
 * pixel coordinates are all large and positive, so the design matrix columns
 * differ by orders of magnitude and the smallest singular vector ends up
 * dominated by floating-point noise rather than by the geometry.
 */
function normalise(points) {
  const n = points.length
  let cx = 0
  let cy = 0
  for (const [x, y] of points) {
    cx += x
    cy += y
  }
  cx /= n
  cy /= n

  let meanDist = 0
  for (const [x, y] of points) meanDist += Math.hypot(x - cx, y - cy)
  meanDist /= n

  // Degenerate input (every point identical) would divide by zero.
  const scale = meanDist > 1e-12 ? Math.SQRT2 / meanDist : 1

  return {
    points: points.map(([x, y]) => [(x - cx) * scale, (y - cy) * scale]),
    T: [scale, 0, -scale * cx, 0, scale, -scale * cy, 0, 0, 1],
  }
}

function matMul3(A, B) {
  const out = new Array(9).fill(0)
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      let sum = 0
      for (let k = 0; k < 3; k += 1) sum += A[r * 3 + k] * B[k * 3 + c]
      out[r * 3 + c] = sum
    }
  }
  return out
}

export function invert3x3(H) {
  const [a, b, c, d, e, f, g, h, i] = H
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  if (Math.abs(det) < 1e-12) return null
  return [
    (e * i - f * h) / det, (c * h - b * i) / det, (b * f - c * e) / det,
    (f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det,
    (d * h - e * g) / det, (b * g - a * h) / det, (a * e - b * d) / det,
  ]
}

/**
 * Smallest-eigenvalue eigenvector of a symmetric matrix, by cyclic Jacobi.
 *
 * The textbook route to a homography is the SVD of the design matrix, but the
 * null vector of A is also the smallest eigenvector of AtA, and Jacobi on a
 * 9x9 symmetric matrix is about thirty lines with no dependencies. It converges
 * quadratically and this matrix is tiny, so the sweep cap is never the binding
 * constraint in practice.
 */
function smallestEigenvector(M, n) {
  const a = M.slice()
  // V accumulates the rotations, so its columns end up as the eigenvectors.
  const V = new Float64Array(n * n)
  for (let i = 0; i < n; i += 1) V[i * n + i] = 1

  for (let sweep = 0; sweep < 60; sweep += 1) {
    let off = 0
    for (let p = 0; p < n; p += 1) {
      for (let q = p + 1; q < n; q += 1) off += a[p * n + q] * a[p * n + q]
    }
    if (off < 1e-24) break

    for (let p = 0; p < n; p += 1) {
      for (let q = p + 1; q < n; q += 1) {
        const apq = a[p * n + q]
        if (Math.abs(apq) < 1e-30) continue

        // Rotation angle that zeroes the (p,q) entry.
        const theta = (a[q * n + q] - a[p * n + p]) / (2 * apq)
        const t =
          Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const cos = 1 / Math.sqrt(t * t + 1)
        const sin = t * cos

        for (let k = 0; k < n; k += 1) {
          const akp = a[k * n + p]
          const akq = a[k * n + q]
          a[k * n + p] = cos * akp - sin * akq
          a[k * n + q] = sin * akp + cos * akq
        }
        for (let k = 0; k < n; k += 1) {
          const apk = a[p * n + k]
          const aqk = a[q * n + k]
          a[p * n + k] = cos * apk - sin * aqk
          a[q * n + k] = sin * apk + cos * aqk
        }
        for (let k = 0; k < n; k += 1) {
          const vkp = V[k * n + p]
          const vkq = V[k * n + q]
          V[k * n + p] = cos * vkp - sin * vkq
          V[k * n + q] = sin * vkp + cos * vkq
        }
      }
    }
  }

  let best = 0
  for (let i = 1; i < n; i += 1) if (a[i * n + i] < a[best * n + best]) best = i

  const vec = new Array(n)
  for (let i = 0; i < n; i += 1) vec[i] = V[i * n + best]
  return vec
}

/**
 * Homography mapping src onto dst, the equivalent of cv2.findHomography.
 *
 * Needs at least four correspondences, no three of them collinear. Returns null
 * rather than a garbage matrix when the system is degenerate, so callers can
 * show "grid not found" instead of rendering a warp made of NaNs.
 */
export function computeHomography(src, dst) {
  if (src.length < 4 || src.length !== dst.length) return null

  const ns = normalise(src)
  const nd = normalise(dst)

  // Each correspondence contributes two rows to the 2N x 9 design matrix.
  const rows = []
  for (let i = 0; i < ns.points.length; i += 1) {
    const [x, y] = ns.points[i]
    const [u, v] = nd.points[i]
    rows.push([-x, -y, -1, 0, 0, 0, u * x, u * y, u])
    rows.push([0, 0, 0, -x, -y, -1, v * x, v * y, v])
  }

  // AtA, so the null vector of A becomes the smallest eigenvector of a 9x9.
  const AtA = new Float64Array(81)
  for (const row of rows) {
    for (let i = 0; i < 9; i += 1) {
      for (let j = 0; j < 9; j += 1) AtA[i * 9 + j] += row[i] * row[j]
    }
  }

  const h = smallestEigenvector(AtA, 9)
  if (h.some((value) => !Number.isFinite(value))) return null

  // Undo the normalisation: H = Td^-1 * Hn * Ts
  const Tdinv = invert3x3(nd.T)
  if (!Tdinv) return null
  const H = matMul3(Tdinv, matMul3(h, ns.T))

  // Fix the scale so comparisons and debugging output are stable.
  if (Math.abs(H[8]) > 1e-12) return H.map((value) => value / H[8])
  return H
}

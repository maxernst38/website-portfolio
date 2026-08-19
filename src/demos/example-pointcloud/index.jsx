import { useEffect, useRef, useState } from 'react'

/**
 * PLACEHOLDER DEMO — proves the live-demo pipeline works end to end.
 *
 * Deliberately dependency-free (plain canvas 2D, ~120 lines) so the framework
 * can be verified without committing to three.js or deck.gl yet. Replace this
 * folder wholesale with a real demo; nothing outside it needs to change.
 *
 * It does illustrate the shape a real one takes: generate/receive data, project
 * it, render each frame, clean up the loop on unmount, and honour
 * prefers-reduced-motion.
 */

const CLUSTERS = [
  { n: 260, cx: -1.1, cy: 0.5, cz: 0.2, color: '#4f46e5' },
  { n: 260, cx: 1.0, cy: -0.4, cz: -0.5, color: '#06b6d4' },
  { n: 260, cx: 0.1, cy: 1.0, cz: 0.9, color: '#f59e0b' },
]

// Deterministic PRNG so the cloud is identical on every visit and between renders.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildPoints() {
  const rand = mulberry32(20260819)
  const pts = []
  for (const c of CLUSTERS) {
    for (let i = 0; i < c.n; i++) {
      // Box-Muller for a gaussian blob rather than a uniform cube.
      const g = () => {
        const u = Math.max(rand(), 1e-9)
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()) * 0.32
      }
      pts.push({ x: c.cx + g(), y: c.cy + g(), z: c.cz + g(), color: c.color })
    }
  }
  return pts
}

export default function ExamplePointCloud() {
  const canvasRef = useRef(null)
  const pointsRef = useRef(buildPoints())
  const angleRef = useRef({ yaw: 0.6, pitch: -0.25 })
  const dragRef = useRef(null)
  const [spinning, setSpinning] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const { yaw, pitch } = angleRef.current
      if (spinning && !reduced && !dragRef.current) angleRef.current.yaw += 0.0035

      ctx.clearRect(0, 0, w, h)
      const scale = Math.min(w, h) * 0.28
      const cy = Math.cos(yaw), sy = Math.sin(yaw)
      const cp = Math.cos(pitch), sp = Math.sin(pitch)

      const projected = pointsRef.current.map((p) => {
        const x1 = p.x * cy - p.z * sy
        const z1 = p.x * sy + p.z * cy
        const y1 = p.y * cp - z1 * sp
        const z2 = p.y * sp + z1 * cp
        const persp = 1 / (1 + z2 * 0.16)
        return {
          sx: w / 2 + x1 * scale * persp,
          sy: h / 2 + y1 * scale * persp,
          depth: z2,
          r: Math.max(1.1, 2.6 * persp),
          color: p.color,
        }
      })

      // Painter's algorithm — far points first so near ones sit on top.
      projected.sort((a, b) => b.depth - a.depth)
      for (const p of projected) {
        ctx.globalAlpha = Math.min(1, Math.max(0.25, 0.85 - p.depth * 0.16))
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [spinning])

  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    dragRef.current = { x: e.clientX, y: e.clientY }
    angleRef.current.yaw += dx * 0.006
    angleRef.current.pitch = Math.max(-1.4, Math.min(1.4, angleRef.current.pitch + dy * 0.006))
  }
  const onPointerUp = (e) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface-subtle">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="block h-[420px] w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Three clusters of points in a rotating three-dimensional space. Drag to rotate."
      />
      <div className="flex items-center justify-between gap-4 border-t border-hairline px-4 py-3">
        <p className="text-sm text-muted">Drag to rotate · {pointsRef.current.length} points</p>
        <button
          type="button"
          onClick={() => setSpinning((v) => !v)}
          className="inline-flex h-9 items-center rounded-input border border-hairline bg-white px-3 text-sm font-medium text-ink hover:border-brand-200"
        >
          {spinning ? 'Pause' : 'Spin'}
        </button>
      </div>
    </div>
  )
}

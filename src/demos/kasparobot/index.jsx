/**
 * Kasparobot, as a tool you can point at a board and play from.
 *
 * Three panels, all live at once rather than a walkthrough: what the board
 * detector sees, what is standing on the squares, and the game itself. The
 * first two are the actual pipeline running on real pixels; the third is
 * Stockfish, compiled to WebAssembly and answering over UCI exactly as the
 * Python's engine does.
 *
 * The honest seam is in panel two. Board geometry is recoverable from a
 * photograph by classical means and is recovered here. Piece *identity* is what
 * the project's YOLO model is for, and a PyTorch model cannot ship to a static
 * page -- so an uploaded photo gets a rough occupancy guess that you correct,
 * and the built-in frames carry their known positions. FOOTNOTES says so on the
 * page too.
 */

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { applyHomography } from './geometry.js'
import { rgbToHsv } from './cv.js'
import { FRAMES, getFrame } from './frames.js'
import {
  DEFAULTS, boardHomographies, buildDetectionBoxes, runDetection, warpToBoard,
} from './pipeline.js'
import { PIECE_GLYPHS, PIECE_NAMES, detectionsForFen, fenToPieces, isLightSquare, squareName } from './board.js'
import { fitBoardCorners, readPosition } from './detect.js'
import { PALETTE, describeIllegal, piecesToFen, placementOf } from './position.js'
import { createEngine } from './engine.js'

const PROC_WIDTH = 500
const WARP_SIZE = 400
const SEARCH_DEPTH = 12
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024

const INK = {
  // Canvas takes colours as values, not classes, so these cannot read the
  // theme tokens — they are the site palette written out. If the theme moves,
  // move these with it.
  familyA: '#0e7490',   // brand-600
  familyB: '#f59e0b',   // amber, the one deliberate contrast against the teal
  point: '#22d3ee',     // accent
  quad: '#6ed8e9',      // brand-300
  handle: '#f43f5e',    // the only warm mark, so a draggable handle stands out
}

export default function KasparobotDemo() {
  const [sourceId, setSourceId] = useState(FRAMES[0].id)
  const [upload, setUpload] = useState(null) // { url, name }
  const [source, setSource] = useState(null) // decoded pixels
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [params, setParams] = useState(DEFAULTS)
  const [corners, setCorners] = useState(FRAMES[0].corners)
  const [pieces, setPieces] = useState({})
  const [sideToMove, setSideToMove] = useState('w')
  const [brush, setBrush] = useState('P')

  const spec = sourceId === 'upload' ? null : getFrame(sourceId)

  /* ── Decode whichever source is selected ─────────────────────────────── */

  useEffect(() => {
    const url = spec ? spec.image : upload?.url
    if (!url) return undefined

    let cancelled = false
    setError(null)
    const image = new Image()
    image.src = url
    image
      .decode()
      .then(() => {
        if (cancelled) return
        const width = PROC_WIDTH
        const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(image, 0, 0, width, height)
        setSource({ image, width, height, rgba: ctx.getImageData(0, 0, width, height).data })
      })
      .catch(() => {
        if (!cancelled) setError('That image could not be decoded. Try a JPEG or PNG.')
      })

    return () => {
      cancelled = true
    }
  }, [spec, upload])

  const deferredParams = useDeferredValue(params)
  const detection = useMemo(
    () => (source ? runDetection(source.rgba, source.width, source.height, deferredParams) : null),
    [source, deferredParams],
  )

  /* ── Corners: shipped for the built-ins, fitted live for an upload ───── */

  useEffect(() => {
    if (!source || !detection) return
    if (spec) {
      setCorners(spec.corners)
      setNotice(null)
      return
    }
    const hsv = rgbToHsv(source.rgba, source.width, source.height)
    const fit = fitBoardCorners(detection.intersections, hsv, source.width, source.height)
    if (fit) {
      setCorners(fit.corners)
      setNotice(
        `Board found automatically — ${fit.inliers} of 81 grid corners matched, ${fit.residual.toFixed(1)}px average. Drag the handles if it sits wrong.`,
      )
    } else {
      // A guess in the right ballpark still beats nothing: the handles are
      // visible and draggable, so a failed fit is recoverable rather than fatal.
      setCorners([[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8]])
      setNotice(
        'The board could not be found automatically — drag the four handles onto the corners of the playing surface.',
      )
    }
  }, [source, detection, spec])

  const homographies = useMemo(
    () => (source ? boardHomographies(source.width, source.height, corners) : null),
    [source, corners],
  )

  const warped = useMemo(
    () =>
      source && homographies?.imageToBoard
        ? warpToBoard(source.rgba, source.width, source.height, homographies.imageToBoard, WARP_SIZE)
        : null,
    [source, homographies],
  )

  /* ── What is standing on the board ───────────────────────────────────── */

  // Built-in frames carry their known position. An upload starts empty and is
  // filled in by hand or by the guess button.
  //
  // Keyed on which photo is loaded, deliberately not on the rectified pixels:
  // those change every time a corner handle moves, and re-reading there would
  // throw away the visitor's own edits mid-drag.
  useEffect(() => {
    if (spec) {
      setPieces(fenToPieces(spec.fen))
      setSideToMove(spec.fen.split(' ')[1] ?? 'w')
    } else {
      setPieces({})
      setSideToMove('w')
    }
  }, [spec, upload])

  /**
   * Fill the board from the classical reader.
   *
   * Opt-in rather than automatic. It is reliable from directly above and quite
   * unreliable at an angle -- a slanted photo rectifies with each tall piece
   * smeared over the squares behind it -- and a confidently wrong position is
   * worse than an empty one you were going to fill in anyway.
   */
  const guessPieces = useCallback(() => {
    if (!warped) return
    const read = readPosition(warped, WARP_SIZE)
    setPieces(read.pieces)
  }, [warped])

  // Where the detector says each piece is, in board units, for the markers on
  // panel two. The built-ins have real box anchors; an upload only knows which
  // square lit up, so its marker sits at that square's centre.
  const markers = useMemo(() => {
    if (!homographies || !source) return []
    if (spec) {
      const boxes = buildDetectionBoxes(homographies, detectionsForFen(spec.fen), {
        orientation: spec.orientation,
        offBoard: spec.offBoard,
        width: source.width,
        height: source.height,
      })
      return boxes.map((box) => {
        const [bx, by] = applyHomography(homographies.imageToBoard, [
          box.cx,
          box.cy + box.height / 2,
        ])
        return { x: bx, y: by, offBoard: Boolean(box.offBoard) }
      })
    }
    return Object.keys(pieces).map((square) => {
      const file = square.charCodeAt(0) - 97
      const rank = Number(square[1])
      return { x: file + 0.5, y: 8 - rank + 0.5, offBoard: false }
    })
  }, [homographies, source, spec, pieces])

  const detectedFen = useMemo(() => piecesToFen(pieces, sideToMove), [pieces, sideToMove])
  const illegal = useMemo(() => describeIllegal(pieces), [pieces])

  /* ── The game ────────────────────────────────────────────────────────── */

  const [game, setGame] = useState(null) // { fen, history, over, status }
  const chessRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [engineReplies, setEngineReplies] = useState(true)

  const loadIntoGame = useCallback((fen) => {
    try {
      const chess = new Chess(fen)
      chessRef.current = chess
      setSelected(null)
      setGame(snapshot(chess))
      return true
    } catch {
      chessRef.current = null
      setGame(null)
      return false
    }
  }, [])

  // Follow the detected position until the first move is made; after that the
  // game has its own history and re-seeding it on every edit would throw the
  // visitor's moves away.
  useEffect(() => {
    if (illegal) {
      chessRef.current = null
      setGame(null)
      return
    }
    if (!game || game.history.length === 0) loadIntoGame(detectedFen)
  }, [detectedFen, illegal]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Engine ──────────────────────────────────────────────────────────── */

  const engineRef = useRef(null)
  const [engineName, setEngineName] = useState(null)
  const [engineError, setEngineError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    const engine = createEngine()
    engineRef.current = engine
    engine
      .start()
      .then(({ name }) => setEngineName(name))
      .catch(() => setEngineError('The engine could not start in this browser.'))
    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  // Analyse whatever position is on the board. Requests are serialised inside
  // the engine wrapper, so a fast sequence of moves queues rather than races.
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !engineName || !game || game.over) {
      if (game?.over) setAnalysis(null)
      return
    }
    let stale = false
    setThinking(true)
    engine
      .analyse(game.fen, { depth: SEARCH_DEPTH })
      .then((result) => {
        if (stale) return
        setAnalysis({ ...result, forFen: game.fen })
        setThinking(false)
      })
      .catch(() => !stale && setThinking(false))
    return () => {
      stale = true
    }
  }, [game, engineName])

  const playEngineMove = useCallback(() => {
    const chess = chessRef.current
    if (!chess || !analysis?.bestMove || analysis.forFen !== chess.fen()) return
    try {
      chess.move({
        from: analysis.bestMove.slice(0, 2),
        to: analysis.bestMove.slice(2, 4),
        promotion: analysis.bestMove[4] ?? 'q',
      })
      setGame(snapshot(chess))
      setSelected(null)
    } catch {
      // The engine's move can only be illegal if the board moved underneath it,
      // in which case the next analysis will supersede it anyway.
    }
  }, [analysis])

  /**
   * Step back to the visitor's own turn, not just one ply.
   *
   * Undoing a single move hands the turn straight back to the engine, which
   * replies with the same move again -- so from the visitor's side the button
   * appears to do nothing at all.
   */
  const undoMove = useCallback(() => {
    const chess = chessRef.current
    if (!chess || chess.history().length === 0) return
    chess.undo()
    const next = snapshot(chess)
    if (engineReplies && next.engineSide && next.turn === next.engineSide && chess.history().length > 0) {
      chess.undo()
    }
    setGame(snapshot(chess))
    setSelected(null)
  }, [engineReplies])

  const onSquare = useCallback(
    (square) => {
      const chess = chessRef.current
      if (!chess || chess.isGameOver()) return

      if (selected) {
        const legal = chess.moves({ square: selected, verbose: true })
        const move = legal.find((m) => m.to === square)
        if (move) {
          chess.move({ from: move.from, to: move.to, promotion: 'q' })
          setGame(snapshot(chess))
          setSelected(null)
          return
        }
      }
      const piece = chess.get(square)
      setSelected(piece && piece.color === chess.turn() ? square : null)
    },
    [selected],
  )

  // The reply fires from the analysis of the position the human just created.
  useEffect(() => {
    if (!engineReplies || !game || game.over || thinking) return undefined
    if (!analysis?.bestMove || analysis.forFen !== game.fen) return undefined
    if (game.history.length === 0) return undefined // don't move first
    if (game.turn !== game.engineSide) return undefined
    const timer = setTimeout(playEngineMove, 250)
    return () => clearTimeout(timer)
  }, [analysis, game, engineReplies, thinking, playEngineMove])

  const legalTargets = useMemo(() => {
    const chess = chessRef.current
    if (!chess || !selected) return new Set()
    return new Set(chess.moves({ square: selected, verbose: true }).map((m) => m.to))
  }, [selected, game])

  /* ── Upload ──────────────────────────────────────────────────────────── */

  const onFile = useCallback(
    (file) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        setError('That is not an image file.')
        return
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setError('That image is larger than 12 MB. Try a smaller one.')
        return
      }
      setError(null)
      // Object URLs are revoked when replaced, so a session of uploads does not
      // pin every previous bitmap in memory.
      setUpload((previous) => {
        if (previous) URL.revokeObjectURL(previous.url)
        return { url: URL.createObjectURL(file), name: file.name }
      })
      setSourceId('upload')
    },
    [],
  )

  useEffect(
    () => () => {
      if (upload) URL.revokeObjectURL(upload.url)
    },
    [upload],
  )

  /* ── Render ──────────────────────────────────────────────────────────── */

  const boardPieces = game && chessRef.current ? fenToPieces(game.fen) : pieces

  return (
    <div className="rounded-card border border-hairline bg-white">
      <SourceBar
        sourceId={sourceId}
        onSelect={(id) => setSourceId(id)}
        upload={upload}
        onFile={onFile}
      />

      {error && (
        <p className="border-b border-hairline bg-red-50 px-4 py-2.5 text-sm text-red-800">{error}</p>
      )}

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel
          title="Board detection"
          hint="Hough lines and the grid points they cross at"
        >
          <BoardCanvas
            source={source}
            detection={detection}
            homographies={homographies}
            corners={corners}
            onCorners={setCorners}
          />
          {detection && (
            <div className="mt-2 space-y-1">
              <Row label="Grid points" value={detection.intersections.length} />
              <Row
                label="Lines"
                value={`${detection.horizontal.length} + ${detection.vertical.length}`}
              />
            </div>
          )}
          {notice && <p className="mt-2 text-xs leading-relaxed text-muted">{notice}</p>}
          <Tuning params={params} onChange={setParams} onReset={() => setParams(DEFAULTS)} />
        </Panel>

        <Panel
          title="Pieces"
          hint={spec ? 'Where the detector puts each piece' : 'Click squares to set the position'}
        >
          <RectifiedBoard
            warped={warped}
            markers={markers}
            pieces={pieces}
            onSquare={(square) =>
              setPieces((current) => {
                const next = { ...current }
                if (brush === '') delete next[square]
                else next[square] = brush
                return next
              })
            }
          />
          <PiecePalette brush={brush} onBrush={setBrush} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SmallToggle
              value={sideToMove}
              onChange={setSideToMove}
              options={[
                { value: 'w', label: 'White to move' },
                { value: 'b', label: 'Black to move' },
              ]}
            />
            {!spec && (
              <>
                <Action onClick={guessPieces}>Guess pieces</Action>
                <Action onClick={() => setPieces({})} disabled={Object.keys(pieces).length === 0}>
                  Clear
                </Action>
              </>
            )}
          </div>
          {!spec && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Set the position with the palette, using the photo behind it as the guide.
              &ldquo;Guess pieces&rdquo; runs a classical reader over the rectified board — it
              works well on a photo taken from directly above and poorly on a slanted one,
              and it always calls everything a pawn.
            </p>
          )}
          <code className="mt-2 block overflow-x-auto rounded-input border border-hairline bg-surface-subtle p-2 text-[10px] leading-relaxed text-ink">
            {detectedFen}
          </code>
          {spec && (
            <p className="mt-1.5 text-xs text-muted">
              {placementOf(detectedFen) === placementOf(spec.fen)
                ? 'Matches the position in the photograph.'
                : 'Edited away from the photograph.'}
            </p>
          )}
        </Panel>

        <Panel title="Play" hint={engineName ?? 'Starting engine…'}>
          {illegal ? (
            <div className="rounded-card border border-dashed border-hairline-strong bg-surface-subtle p-5 text-center">
              <p className="text-sm text-body">{illegal}</p>
            </div>
          ) : (
            <>
              <PlayBoard
                pieces={boardPieces}
                selected={selected}
                targets={legalTargets}
                lastMove={game?.lastMove}
                bestMove={analysis?.forFen === game?.fen ? analysis?.bestMove : null}
                onSquare={onSquare}
              />
              <EngineReadout
                game={game}
                analysis={analysis}
                thinking={thinking}
                engineName={engineName}
                engineError={engineError}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Action onClick={() => loadIntoGame(detectedFen)}>Reset to photo</Action>
                <Action onClick={undoMove} disabled={!game || game.history.length === 0}>
                  Undo
                </Action>
                <Action onClick={playEngineMove} disabled={!analysis?.bestMove || thinking}>
                  Play engine move
                </Action>
                <label className="ml-auto inline-flex items-center gap-1.5 text-xs text-body">
                  <input
                    type="checkbox"
                    checked={engineReplies}
                    onChange={(event) => setEngineReplies(event.target.checked)}
                    className="accent-brand-600"
                  />
                  Engine replies
                </label>
              </div>
              {game?.history.length > 0 && (
                <p className="mt-2 max-h-16 overflow-y-auto text-xs leading-relaxed text-muted">
                  {game.history.join('  ')}
                </p>
              )}
            </>
          )}
        </Panel>
      </div>

      <Footnotes />
    </div>
  )
}

/**
 * A plain snapshot of the game, because chess.js mutates in place.
 *
 * React re-renders on identity change, and a mutated instance keeps the same
 * identity -- so handing the tree the object itself would leave the board
 * showing the position before the move.
 */
function snapshot(chess) {
  const history = chess.history()
  const verbose = chess.history({ verbose: true })
  const last = verbose[verbose.length - 1]
  return {
    fen: chess.fen(),
    turn: chess.turn(),
    history,
    lastMove: last ? { from: last.from, to: last.to } : null,
    over: chess.isGameOver(),
    check: chess.isCheck(),
    status: chess.isCheckmate()
      ? 'Checkmate'
      : chess.isStalemate()
        ? 'Stalemate'
        : chess.isDraw()
          ? 'Draw'
          : null,
    // Whoever was not to move when the position was loaded is the engine's
    // side, so the human keeps the side they started playing.
    engineSide: verbose.length ? (verbose[0].color === 'w' ? 'b' : 'w') : null,
  }
}

/* ── Source bar ──────────────────────────────────────────────────────── */

function SourceBar({ sourceId, onSelect, upload, onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        onFile(event.dataTransfer.files?.[0])
      }}
      className={
        dragging
          ? 'flex flex-wrap items-center gap-1.5 border-b border-brand-300 bg-brand-50 p-3'
          : 'flex flex-wrap items-center gap-1.5 border-b border-hairline p-3'
      }
    >
      <span className="mr-1 font-mono text-eyebrow font-semibold uppercase text-muted">Photo</span>
      {FRAMES.map((frame) => (
        <button
          key={frame.id}
          type="button"
          onClick={() => onSelect(frame.id)}
          aria-pressed={sourceId === frame.id}
          title={frame.blurb}
          className={pill(sourceId === frame.id)}
        >
          {frame.label}
        </button>
      ))}

      {upload && (
        <button
          type="button"
          onClick={() => onSelect('upload')}
          aria-pressed={sourceId === 'upload'}
          className={pill(sourceId === 'upload')}
          title={upload.name}
        >
          <span className="max-w-[10rem] truncate">{upload.name}</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-pill border border-dashed border-hairline-strong bg-white px-3 text-xs font-medium text-body hover:border-brand-300 hover:text-brand-700"
      >
        Upload a photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          onFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}

const pill = (active) =>
  active
    ? 'inline-flex h-8 items-center rounded-pill border border-brand-200 bg-brand-50 px-3 text-xs font-medium text-brand-700'
    : 'inline-flex h-8 items-center rounded-pill border border-hairline bg-white px-3 text-xs font-medium text-body hover:border-brand-200'

/* ── Panels ──────────────────────────────────────────────────────────── */

function Panel({ title, hint, children }) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className="text-xs text-muted">{hint}</span>
      </div>
      {children}
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums font-medium text-ink">{value}</span>
    </div>
  )
}

/**
 * The source frame with the detector's output drawn over it, and the four
 * corner handles that decide where the board is.
 *
 * The handles matter more than they look: everything downstream is a function
 * of those four points, so being able to nudge them is what makes an
 * uncooperative photograph usable instead of a dead end.
 */
function BoardCanvas({ source, detection, homographies, corners, onCorners }) {
  const canvasRef = useRef(null)
  const [drag, setDrag] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !source) return
    canvas.width = source.width * 2
    canvas.height = source.height * 2
    const ctx = canvas.getContext('2d')
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    ctx.clearRect(0, 0, source.width, source.height)
    ctx.drawImage(source.image, 0, 0, source.width, source.height)

    if (detection) {
      drawLines(ctx, detection.horizontal, INK.familyA, source.width, source.height)
      drawLines(ctx, detection.vertical, INK.familyB, source.width, source.height)
      ctx.fillStyle = INK.point
      for (const [x, y] of detection.intersections) {
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (homographies?.imageCorners) {
      const pts = homographies.imageCorners
      ctx.strokeStyle = INK.quad
      ctx.lineWidth = 1.5
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
      ctx.stroke()

      for (const [x, y] of pts) {
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.lineWidth = 2.5
        ctx.strokeStyle = INK.handle
        ctx.stroke()
      }
    }
  }, [source, detection, homographies])

  const toFraction = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return [
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    ]
  }, [])

  const onPointerDown = useCallback(
    (event) => {
      const [fx, fy] = toFraction(event)
      let nearest = -1
      let best = 0.06 // in fractional units, so the grab radius scales with the canvas
      corners.forEach(([cx, cy], index) => {
        const d = Math.hypot(cx - fx, cy - fy)
        if (d < best) {
          best = d
          nearest = index
        }
      })
      if (nearest >= 0) {
        event.currentTarget.setPointerCapture(event.pointerId)
        setDrag(nearest)
      }
    },
    [corners, toFraction],
  )

  const onPointerMove = useCallback(
    (event) => {
      if (drag === null) return
      const point = toFraction(event)
      onCorners(corners.map((corner, index) => (index === drag ? point : corner)))
    },
    [drag, corners, onCorners, toFraction],
  )

  const endDrag = useCallback(() => setDrag(null), [])

  if (!source) {
    return (
      <div className="grid aspect-[3/2] place-items-center rounded-card border border-hairline bg-surface-subtle text-sm text-muted">
        Loading…
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="block h-auto w-full touch-none rounded-card border border-hairline bg-chrome"
      style={{ cursor: drag === null ? 'grab' : 'grabbing' }}
      aria-label="Detected board lines and grid points. Drag the four corner handles to adjust."
    />
  )
}

/**
 * The colour window the board is found inside.
 *
 * Collapsed, because it is not part of the story — but it has to be reachable.
 * create_mask keeps pixels inside one HSV range, and the committed range suits
 * the wooden boards here. Point this at a green vinyl mat, or a black-and-white
 * plastic set, and nothing is detected until the window moves. That is a real
 * property of the technique rather than a bug, and it is the first thing to
 * reach for when an uploaded photo finds no grid.
 */
function Tuning({ params, onChange, onReset }) {
  const set = (patch) => onChange({ ...params, ...patch })
  const bounds = (index, value, which) => {
    const next = which === 'lower' ? [...params.lower] : [...params.upper]
    next[index] = value
    return which === 'lower' ? { lower: next } : { upper: next }
  }

  return (
    <details className="mt-2 rounded-input border border-hairline">
      <summary className="cursor-pointer px-2.5 py-1.5 text-xs text-muted marker:text-muted">
        Detection settings
      </summary>
      <div className="space-y-1.5 border-t border-hairline px-2.5 py-2">
        <p className="text-xs leading-relaxed text-muted">
          The mask keeps one band of colour. Widen it if a photo of yours finds no grid.
        </p>
        <Slider
          label="Hue"
          value={params.lower[0]}
          max={179}
          onChange={(v) => set(bounds(0, v, 'lower'))}
        />
        <Slider
          label="to"
          value={params.upper[0]}
          max={179}
          onChange={(v) => set(bounds(0, v, 'upper'))}
        />
        <Slider
          label="Max brightness"
          value={params.upper[2]}
          max={255}
          onChange={(v) => set(bounds(2, v, 'upper'))}
        />
        <Slider
          label="Line votes"
          value={params.houghThreshold}
          min={30}
          max={220}
          onChange={(v) => set({ houghThreshold: v })}
        />
        <button
          type="button"
          onClick={onReset}
          className="mt-1 h-7 rounded-input border border-hairline bg-white px-2 text-xs font-medium text-body hover:border-brand-200"
        >
          Reset
        </button>
      </div>
    </details>
  )
}

function Slider({ label, value, onChange, min = 0, max = 255 }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-xs text-muted">
        {label}
        <span className="tabular-nums text-ink">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-0.5 w-full accent-brand-600"
      />
    </label>
  )
}

function drawLines(ctx, lines, colour, width, height) {
  ctx.strokeStyle = colour
  ctx.lineWidth = 0.8
  ctx.globalAlpha = 0.6
  const reach = Math.hypot(width, height)
  for (const { rho, theta } of lines) {
    const cos = Math.cos(theta)
    const sin = Math.sin(theta)
    ctx.beginPath()
    ctx.moveTo(cos * rho + reach * -sin, sin * rho + reach * cos)
    ctx.lineTo(cos * rho - reach * -sin, sin * rho - reach * cos)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/** The rectified board, with detection markers and a click-to-edit overlay. */
function RectifiedBoard({ warped, markers, pieces, onSquare }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !warped) return
    canvas.width = WARP_SIZE
    canvas.height = WARP_SIZE
    const ctx = canvas.getContext('2d')
    ctx.putImageData(new ImageData(warped.slice(), WARP_SIZE, WARP_SIZE), 0, 0)

    const cell = WARP_SIZE / 8
    ctx.strokeStyle = 'rgba(79,70,229,0.35)'
    ctx.lineWidth = 1
    for (let i = 1; i < 8; i += 1) {
      ctx.beginPath()
      ctx.moveTo(i * cell, 0)
      ctx.lineTo(i * cell, WARP_SIZE)
      ctx.moveTo(0, i * cell)
      ctx.lineTo(WARP_SIZE, i * cell)
      ctx.stroke()
    }

    for (const marker of markers) {
      // Markers outside the board are the pieces the square lookup rejected.
      const x = marker.x * cell
      const y = marker.y * cell
      ctx.beginPath()
      ctx.arc(Math.max(4, Math.min(WARP_SIZE - 4, x)), Math.max(4, Math.min(WARP_SIZE - 4, y)), 4, 0, Math.PI * 2)
      ctx.fillStyle = marker.offBoard ? '#d97706' : '#e11d48'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.stroke()
    }
  }, [warped, markers])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="block aspect-square h-auto w-full rounded-card border border-hairline bg-chrome"
        aria-label="Rectified board with detected pieces"
      />
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {Array.from({ length: 64 }, (_, index) => {
          const file = index % 8
          const rank = 8 - Math.floor(index / 8)
          const square = squareName(file, rank)
          const piece = pieces[square]
          return (
            <button
              key={square}
              type="button"
              onClick={() => onSquare(square)}
              title={piece ? `${PIECE_NAMES[piece.toLowerCase()]} on ${square}` : square}
              className="grid place-items-center text-[clamp(0.6rem,1.6vw,1rem)] leading-none hover:bg-brand-500/25"
            >
              {piece && (
                <span
                  style={{
                    color: piece === piece.toUpperCase() ? '#ffffff' : '#0f172a',
                    WebkitTextStroke: piece === piece.toUpperCase() ? '0.9px #334155' : '0.5px #f8fafc',
                    paintOrder: 'stroke fill',
                  }}
                >
                  {PIECE_GLYPHS[piece.toLowerCase()]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PiecePalette({ brush, onBrush }) {
  return (
    <div className="mt-2 flex w-fit items-stretch gap-1">
      <div className="grid grid-cols-6 gap-1">
      {PALETTE.flat().map((piece) => (
        <button
          key={piece}
          type="button"
          onClick={() => onBrush(piece)}
          aria-pressed={brush === piece}
          title={`${PIECE_NAMES[piece.toLowerCase()]} (${piece === piece.toUpperCase() ? 'white' : 'black'})`}
          className={
            brush === piece
              ? 'grid h-7 w-7 place-items-center rounded-input border border-brand-300 bg-brand-50 text-base leading-none'
              : 'grid h-7 w-7 place-items-center rounded-input border border-hairline bg-white text-base leading-none hover:border-brand-200'
          }
        >
          <span
            style={{
              color: piece === piece.toUpperCase() ? '#ffffff' : '#0f172a',
              WebkitTextStroke: piece === piece.toUpperCase() ? '0.9px #334155' : '0.4px #cbd5e1',
              paintOrder: 'stroke fill',
            }}
          >
            {PIECE_GLYPHS[piece.toLowerCase()]}
          </span>
        </button>
      ))}
      </div>
      {/* Outside the grid so the two colours stay in clean rows of six. */}
      <button
        type="button"
        onClick={() => onBrush('')}
        aria-pressed={brush === ''}
        title="Clear a square"
        className={`rounded-input border px-2 text-xs font-medium ${
          brush === ''
            ? 'border-brand-300 bg-brand-50 text-brand-700'
            : 'border-hairline bg-white text-body hover:border-brand-200'
        }`}
      >
        Erase
      </button>
    </div>
  )
}

/** The playable board. */
function PlayBoard({ pieces, selected, targets, lastMove, bestMove, onSquare }) {
  const from = bestMove?.slice(0, 2)
  const to = bestMove?.slice(2, 4)

  return (
    <div className="grid grid-cols-8 overflow-hidden rounded-card border border-hairline">
      {Array.from({ length: 64 }, (_, index) => {
        const file = index % 8
        const rank = 8 - Math.floor(index / 8)
        const square = squareName(file, rank)
        const piece = pieces[square]
        const light = isLightSquare(file, rank)
        const isSelected = selected === square
        const isTarget = targets.has(square)
        const isLast = lastMove && (lastMove.from === square || lastMove.to === square)
        const isBest = square === from || square === to

        return (
          <button
            key={square}
            type="button"
            onClick={() => onSquare(square)}
            className={`relative grid aspect-square place-items-center text-[clamp(0.9rem,2.6vw,1.6rem)] leading-none ${
              light ? 'bg-[#f0e5d2]' : 'bg-[#b98863]'
            } ${isSelected ? 'ring-2 ring-inset ring-brand-600' : ''}`}
          >
            {isLast && <span className="absolute inset-0 bg-amber-300/35" aria-hidden="true" />}
            {isBest && (
              <span
                className="absolute inset-0 border-2 border-emerald-500/80"
                aria-hidden="true"
              />
            )}
            {isTarget && (
              <span
                className={`absolute rounded-full bg-brand-700/45 ${piece ? 'inset-1 border-4 border-brand-700/45 bg-transparent' : 'h-1/4 w-1/4'}`}
                aria-hidden="true"
              />
            )}
            {piece && (
              <span
                className="relative"
                style={{
                  color: piece === piece.toUpperCase() ? '#ffffff' : '#0f172a',
                  WebkitTextStroke: piece === piece.toUpperCase() ? '1px #334155' : '0.5px #f8fafc',
                  paintOrder: 'stroke fill',
                }}
              >
                {PIECE_GLYPHS[piece.toLowerCase()]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function EngineReadout({ game, analysis, thinking, engineName, engineError }) {
  if (engineError) {
    return <p className="mt-2 text-xs text-red-700">{engineError}</p>
  }
  if (!engineName) {
    return <p className="mt-2 text-xs text-muted">Loading the engine…</p>
  }
  if (game?.over) {
    return (
      <p className="mt-2 text-sm font-medium text-ink">
        {game.status}
        {game.status === 'Checkmate' ? ` — ${game.turn === 'w' ? 'Black' : 'White'} wins.` : ''}
      </p>
    )
  }

  const fresh = analysis && analysis.forFen === game?.fen
  return (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
      <span className="text-muted">
        {game?.turn === 'w' ? 'White' : 'Black'} to move
        {game?.check ? ' — in check' : ''}
      </span>
      {thinking || !fresh ? (
        <span className="text-muted">thinking…</span>
      ) : (
        <>
          <span className="font-medium text-ink">
            Best: {formatMove(analysis.bestMove)}
          </span>
          <span className="tabular-nums text-muted">{formatScore(analysis, game?.turn)}</span>
          <span className="text-muted">depth {analysis.depth}</span>
        </>
      )}
    </div>
  )
}

function formatMove(move) {
  if (!move) return '—'
  return `${move.slice(0, 2)}→${move.slice(2, 4)}${move[4] ? `=${move[4].toUpperCase()}` : ''}`
}

/**
 * UCI scores are from the side to move; this reports them from White's, which
 * is the convention every chess interface uses and the only one that stays
 * stable as the turn alternates.
 */
function formatScore(analysis, turn) {
  const sign = turn === 'w' ? 1 : -1
  if (analysis.mateIn !== null && analysis.mateIn !== undefined) {
    return `mate in ${Math.abs(analysis.mateIn)}`
  }
  if (analysis.scoreCp === null || analysis.scoreCp === undefined) return ''
  const pawns = (analysis.scoreCp * sign) / 100
  return `${pawns > 0 ? '+' : ''}${pawns.toFixed(2)}`
}

function SmallToggle({ value, onChange, options }) {
  return (
    <div className="inline-flex gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={
            value === option.value
              ? 'h-7 rounded-input border border-brand-300 bg-brand-50 px-2 text-xs font-medium text-brand-700'
              : 'h-7 rounded-input border border-hairline bg-white px-2 text-xs font-medium text-body hover:border-brand-200'
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Action({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 items-center rounded-input border border-hairline bg-white px-2.5 text-xs font-medium text-body hover:border-brand-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Footnotes() {
  return (
    <div className="border-t border-hairline bg-surface-subtle px-4 py-3 text-xs leading-relaxed text-muted">
      <p>
        The board detection — HSV mask, Canny, Hough transform, clustering, homography and
        rectification — is this project&rsquo;s Python ported to run in your browser, and it
        runs on whatever photo is loaded, including your own. The engine is a real
        Stockfish, compiled to WebAssembly and driven over UCI (
        <a
          href="/stockfish/LICENSE.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
        >
          GPL-3.0
        </a>
        ).
      </p>
      <p className="mt-1.5">
        What is <em>not</em> here is the piece detector. That is a YOLO model in PyTorch and
        cannot run on a static page, so the three built-in photos (
        <a
          href="https://commons.wikimedia.org/wiki/Category:Chess_game_Staunton_No._6"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
        >
          Wilfredor, CC0
        </a>
        ) carry their known positions, and an uploaded photo starts empty for you to set up
        with the palette. &ldquo;Guess pieces&rdquo; will have a go at it — it reads occupancy
        and rough brightness off the rectified board, which is dependable from directly above
        and much less so at an angle, and it calls everything a pawn either way. Nothing
        downstream cares where the position came from. Uploads are read in your browser and
        never sent anywhere.
      </p>
    </div>
  )
}

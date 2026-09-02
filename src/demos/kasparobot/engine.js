/**
 * Stockfish, running in a Web Worker.
 *
 * The real project shells out to a native Stockfish binary. A static page
 * cannot do that, so this drives the WebAssembly build over the same UCI
 * protocol -- the messages here are exactly the ones ChessBoard.py sends.
 *
 * The single-threaded build is deliberate. The threaded one is faster but needs
 * COOP/COEP headers on every response from the whole site and still refuses to
 * run on mobile browsers, which is a bad trade for one page.
 *
 * Stockfish is GPL-3.0 and stays a separate program: it is loaded as its own
 * binary from /stockfish and only ever spoken to over UCI. Its licence ships
 * next to it at /stockfish/LICENSE.txt.
 */

const ENGINE_URL = '/stockfish/stockfish.wasm.js'

/** UCI 'go' output is a stream; a search is done when 'bestmove' arrives. */
export function createEngine() {
  let worker = null
  let ready = null
  let name = 'Stockfish'
  // One search at a time. UCI has no request ids, so a second 'go' before the
  // first returns would resolve the wrong promise.
  let pending = null
  let queue = Promise.resolve()

  function boot() {
    if (ready) return ready
    ready = new Promise((resolve, reject) => {
      try {
        worker = new Worker(ENGINE_URL)
      } catch (error) {
        reject(error)
        return
      }

      let info = null
      const timeout = setTimeout(() => reject(new Error('The engine did not start.')), 30000)

      worker.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('The engine could not be loaded.'))
      }

      worker.onmessage = (event) => {
        const line = typeof event.data === 'string' ? event.data : ''
        if (!line) return

        // Report whatever build actually answered rather than a version
        // hardcoded here, which would quietly go stale.
        if (line.startsWith('id name ')) name = line.slice(8).trim()

        if (line === 'uciok') {
          clearTimeout(timeout)
          resolve({ name })
          return
        }

        if (!pending) return

        // Keep the deepest line seen: the last 'info' before 'bestmove' is the
        // engine's final word on score and principal variation.
        if (line.startsWith('info ') && line.includes(' pv ')) info = parseInfo(line)

        if (line.startsWith('bestmove')) {
          const move = line.split(/\s+/)[1]
          const settle = pending
          pending = null
          settle.resolve({
            bestMove: move && move !== '(none)' ? move : null,
            ponder: /ponder (\S+)/.exec(line)?.[1] ?? null,
            ...info,
            engine: name,
          })
          info = null
        }
      }

      worker.postMessage('uci')
    })
    return ready
  }

  return {
    start: boot,
    get name() {
      return name
    },

    /**
     * Best move for a position. Serialised through `queue` so overlapping calls
     * -- a fast clicker, or an analysis firing while the reply is still being
     * searched -- line up instead of colliding on the single UCI channel.
     */
    analyse(fen, { depth = 12 } = {}) {
      queue = queue.then(async () => {
        await boot()
        return new Promise((resolve, reject) => {
          pending = { resolve, reject }
          worker.postMessage('ucinewgame')
          worker.postMessage(`position fen ${fen}`)
          worker.postMessage(`go depth ${depth}`)
        })
      })
      return queue
    },

    stop() {
      if (worker) worker.postMessage('stop')
    },

    dispose() {
      if (!worker) return
      try {
        worker.postMessage('quit')
      } catch {
        // The worker may already be gone; nothing to do about it.
      }
      worker.terminate()
      worker = null
      ready = null
      pending = null
    },
  }
}

/**
 * Pull depth, score and PV out of a UCI info line.
 *
 * Scores are from the side to move, which is why the caller has to know whose
 * turn it is before showing a sign to anyone.
 */
function parseInfo(line) {
  const depth = Number(/\bdepth (\d+)/.exec(line)?.[1] ?? 0)
  const cp = /\bscore cp (-?\d+)/.exec(line)?.[1]
  const mate = /\bscore mate (-?\d+)/.exec(line)?.[1]
  const pv = /\bpv (.+)$/.exec(line)?.[1]?.trim() ?? ''
  return {
    depth,
    scoreCp: cp === undefined ? null : Number(cp),
    mateIn: mate === undefined ? null : Number(mate),
    pv: pv ? pv.split(/\s+/) : [],
  }
}

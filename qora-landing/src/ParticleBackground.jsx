import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const NODE_COUNT = 40
    let nodes = []
    let signals = []

    const initNodes = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1.5,
        brightness: Math.random(),
      }))
    }
    initNodes()
    window.addEventListener('resize', initNodes)

    // Build edges — each node connects to 2-3 nearest
    const getEdges = () => {
      const edges = []
      nodes.forEach((a, i) => {
        const sorted = nodes
          .map((b, j) => ({ j, dist: Math.hypot(a.x - b.x, a.y - b.y) }))
          .filter(e => e.j !== i)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3)
        sorted.forEach(({ j }) => {
          if (!edges.find(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
            edges.push({ a: i, b: j })
          }
        })
      })
      return edges
    }

    let edges = getEdges()

    // Spawn signals periodically
    const spawnSignal = () => {
      const edge = edges[Math.floor(Math.random() * edges.length)]
      signals.push({ edge, t: 0, speed: 0.004 + Math.random() * 0.004 })
    }

    const signalInterval = setInterval(spawnSignal, 300)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      edges.forEach(({ a, b }) => {
        const na = nodes[a], nb = nodes[b]
        ctx.beginPath()
        ctx.moveTo(na.x, na.y)
        ctx.lineTo(nb.x, nb.y)
        ctx.strokeStyle = 'rgba(99, 130, 180, 0.12)'
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      // Draw signals traveling along edges
      signals.forEach(sig => {
        sig.t += sig.speed
        const na = nodes[sig.edge.a]
        const nb = nodes[sig.edge.b]
        const px = na.x + (nb.x - na.x) * sig.t
        const py = na.y + (nb.y - na.y) * sig.t

        // Trail
        const trailLen = 0.12
        const t0 = Math.max(0, sig.t - trailLen)
        const tx = na.x + (nb.x - na.x) * t0
        const ty = na.y + (nb.y - na.y) * t0

        const grad = ctx.createLinearGradient(tx, ty, px, py)
        grad.addColorStop(0, 'rgba(96, 165, 250, 0)')
        grad.addColorStop(1, 'rgba(96, 165, 250, 0.9)')
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(px, py)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Head glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 6)
        glow.addColorStop(0, 'rgba(147, 210, 255, 0.8)')
        glow.addColorStop(1, 'rgba(147, 210, 255, 0)')
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      })

      // Remove finished signals
      signals = signals.filter(s => s.t < 1)

      // Draw nodes
      nodes.forEach(n => {
        // Glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5)
        glow.addColorStop(0, 'rgba(96, 165, 250, 0.15)')
        glow.addColorStop(1, 'rgba(96, 165, 250, 0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 197, 253, ${0.5 + n.brightness * 0.5})`
        ctx.fill()
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(signalInterval)
      window.removeEventListener('resize', resize)
      window.removeEventListener('resize', initNodes)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}

import { useEffect, useRef } from 'react'

// ── Palette cacao → chocolat ─────────────────────────────────
const BEAN_BASE   = [107, 66, 38]    // #6B4226
const CHOCO_BASE  = [42, 21, 9]      // #2A1509
// Tons variés pour les mini-fèves flottantes (orange cabosse, brun fève, chocolat)
const PARTICLE_COLORS = ['#D4641A', '#8B5E34', '#3D2314']

function rand(min, max) { return Math.random() * (max - min) + min }
function lerp(a, b, t) { return a + (b - a) * t }
function lerpColor(c1, c2, t) {
  const r = Math.round(lerp(c1[0], c2[0], t))
  const g = Math.round(lerp(c1[1], c2[1], t))
  const b = Math.round(lerp(c1[2], c2[2], t))
  return `rgb(${r},${g},${b})`
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/**
 * Couche décorative Canvas2D : fèves de cacao flottantes dont certaines
 * se transforment progressivement en carrés de chocolat au fil du scroll,
 * + particules discrètes couleur cacao. Léger, pas de WebGL/Three.js.
 */
export default function CacaoCanvas({ className = '' }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(hover: none)').matches
    const isMobile = window.innerWidth < 768

    const beanCount = isMobile ? 6 : 12
    // Mini-fèves flottantes : plus nombreuses pour un effet plus vivant,
    // tout en restant raisonnable pour ne pas peser sur les perfs (Canvas2D,
    // pas de WebGL — chaque fève est une forme simple, pas de dégradé coûteux).
    const particleCount = isMobile ? 12 : 34
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let beans = []
    let particles = []
    let rafId = null
    let visible = true
    let mouseX = 0
    let mouseY = 0
    let parallaxX = 0
    let parallaxY = 0

    function initShapes() {
      beans = Array.from({ length: beanCount }, (_, i) => ({
        x: rand(0, width),
        y: rand(0, height),
        size: rand(20, 36),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.0012, 0.0012),
        bobPhase: rand(0, Math.PI * 2),
        bobSpeed: rand(0.0007, 0.0013),
        bobAmp: rand(8, 14),
        morphs: i % 3 === 0,
        parallaxFactor: rand(0.25, 0.9),
        opacity: rand(0.55, 0.9),
      }))
      particles = Array.from({ length: particleCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        // Taille d'une mini-fève (ovale), pas juste un point
        w: rand(3, 6.5),
        h: rand(4.5, 9),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.0006, 0.0006),
        speed: rand(0.08, 0.22),
        drift: rand(-0.12, 0.12),
        phase: rand(0, Math.PI * 2),
        baseOpacity: rand(0.10, 0.24),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      }))
    }

    function resize() {
      width = container.clientWidth
      height = container.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initShapes()
    }

    function scrollProgress() {
      const rect = container.getBoundingClientRect()
      const total = rect.height + window.innerHeight
      const scrolled = window.innerHeight - rect.top
      return Math.min(Math.max(scrolled / total, 0), 1)
    }

    function drawBean(b, t, morphT) {
      const bob = Math.sin(t * b.bobSpeed + b.bobPhase) * b.bobAmp
      const px = b.x + parallaxX * b.parallaxFactor
      const py = b.y + bob + parallaxY * b.parallaxFactor
      const rotation = b.rotation + t * b.rotSpeed
      const localMorph = b.morphs ? morphT : 0

      const w = b.size
      const h = b.size * lerp(1.45, 1, localMorph)
      const radius = lerp(w * 0.5, 7, localMorph)
      const color = lerpColor(BEAN_BASE, CHOCO_BASE, localMorph)

      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(rotation)
      ctx.globalAlpha = b.opacity

      roundRectPath(ctx, -w / 2, -h / 2, w, h, radius)
      ctx.fillStyle = color
      ctx.fill()

      // reflet
      roundRectPath(ctx, -w / 2 + w * 0.16, -h / 2 + h * 0.14, w * 0.32, h * 0.22, radius * 0.5)
      ctx.fillStyle = localMorph > 0.4
        ? `rgba(232,118,42,${0.18 + localMorph * 0.12})`
        : 'rgba(255,255,255,0.10)'
      ctx.fill()

      ctx.restore()
    }

    function drawParticle(p, t) {
      const drift = Math.sin(t * 0.0006 + p.phase) * 10
      const y = ((p.y - t * p.speed) % (height + 20) + (height + 20)) % (height + 20)
      const x = p.x + drift
      const rotation = p.rotation + t * p.rotSpeed

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = p.baseOpacity * (0.6 + 0.4 * Math.sin(t * 0.0009 + p.phase))

      // Corps de la mini-fève (ovale, pas un simple cercle)
      ctx.beginPath()
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()

      // Petit reflet pour suggérer le volume, sans coût de dégradé
      ctx.beginPath()
      ctx.ellipse(-p.w * 0.14, -p.h * 0.2, p.w * 0.22, p.h * 0.16, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.fill()

      ctx.restore()
    }

    function frame(t) {
      if (!visible) return
      ctx.clearRect(0, 0, width, height)

      parallaxX = lerp(parallaxX, mouseX, 0.06)
      parallaxY = lerp(parallaxY, mouseY, 0.06)

      const morphT = scrollProgress()

      particles.forEach((p) => drawParticle(p, t))
      beans.forEach((b) => drawBean(b, t, morphT))

      rafId = requestAnimationFrame(frame)
    }

    function handleMouseMove(e) {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 24
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 24
    }

    resize()
    window.addEventListener('resize', resize)
    if (!isTouch) window.addEventListener('mousemove', handleMouseMove)

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !reducedMotion
        if (visible && !rafId) rafId = requestAnimationFrame(frame)
        if (!visible && rafId) { cancelAnimationFrame(rafId); rafId = null }
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    if (reducedMotion) {
      // Rendu statique unique, sans boucle d'animation
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => drawParticle(p, 0))
      beans.forEach((b) => drawBean(b, 0, 0))
    } else {
      rafId = requestAnimationFrame(frame)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function AnimatedBackground() {
  const { isDark } = useTheme()
  const cursorGlowRef = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    let animFrame
    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.06
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.06
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = currentPos.current.x - 300 + 'px'
        cursorGlowRef.current.style.top = currentPos.current.y - 300 + 'px'
      }
      animFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animFrame)
    }
  }, [])

  if (!isDark) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: -1, overflow: 'hidden',
        background: 'linear-gradient(160deg, #faf5ff 0%, #f3e8ff 30%, #ede9fe 60%, #faf5ff 100%)'
      }}>
        {/* Top left soft purple orb */}
        <div style={{
          position: 'absolute', width: '700px', height: '700px',
          top: '-150px', left: '-150px',
          background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animation: 'orb-float-1 10s ease-in-out infinite'
        }} />
        {/* Bottom right violet orb */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          bottom: '-100px', right: '-100px',
          background: 'radial-gradient(circle, rgba(196,181,253,0.4) 0%, rgba(167,139,250,0.2) 50%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(60px)',
          animation: 'orb-float-2 13s ease-in-out infinite'
        }} />
        {/* Center soft pink accent */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          top: '40%', left: '55%',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgba(232,121,249,0.15) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(80px)',
          animation: 'orb-float-3 15s ease-in-out infinite'
        }} />
        {/* Cursor glow */}
        <div
          ref={cursorGlowRef}
          style={{
            position: 'absolute', width: '500px', height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(167,139,250,0.08) 45%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none'
          }}
        />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 85%)'
        }} />
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: -1, overflow: 'hidden',
      background: 'linear-gradient(160deg, #1a0933 0%, #110822 30%, #0a0618 60%, #080514 100%)'
    }}>
      {/* Top left purple orb */}
      <div style={{
        position: 'absolute', width: '800px', height: '800px',
        top: '-200px', left: '-200px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(109,40,217,0.1) 45%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'orb-float-1 10s ease-in-out infinite'
      }} />
      {/* Bottom right deep purple orb */}
      <div style={{
        position: 'absolute', width: '700px', height: '700px',
        bottom: '-150px', right: '-150px',
        background: 'radial-gradient(circle, rgba(91,33,182,0.2) 0%, rgba(76,29,149,0.08) 50%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(70px)',
        animation: 'orb-float-2 13s ease-in-out infinite'
      }} />
      {/* Subtle pink/magenta accent */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        top: '30%', right: '20%',
        background: 'radial-gradient(circle, rgba(219,39,119,0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(80px)',
        animation: 'orb-float-3 15s ease-in-out infinite'
      }} />
      {/* Cursor following glow */}
      <div
        ref={cursorGlowRef}
        style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none'
        }}
      />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 85%)'
      }} />
    </div>
  )
}

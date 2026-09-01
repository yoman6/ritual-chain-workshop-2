'use client'
import { useEffect, useState } from 'react'

interface Particle {
  id: number; x: number; color: string; delay: number; size: number
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!trigger) return
    const p: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id:    i,
      x:     Math.random() * 300 - 150,
      color: i % 4 === 0 ? '#6366f1' : i % 4 === 1 ? '#a5b4fc' : i % 4 === 2 ? '#3b82f6' : '#f43f5e',
      delay: Math.random() * 0.3,
      size:  Math.random() * 6 + 4,
    }))
    setParticles(p)
    setTimeout(() => setParticles([]), 2000)
  }, [trigger])

  if (particles.length === 0) return null

  return (
    <div style={{ position: 'fixed', top: '40%', left: '50%', pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position:     'absolute',
            left:         `${p.x}px`,
            width:        p.size,
            height:       p.size,
            background:   p.color,
            borderRadius: '50%',
            animation:    `confettiDrop 1.5s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}

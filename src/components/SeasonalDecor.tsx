'use client'

import { useEffect, useState } from 'react'

// Seasonal layer: November 15 through January 6 in production.
// Development always shows it so the decoration can be previewed any time.
function isHolidaySeason(date: Date): boolean {
  const month = date.getMonth()
  const day = date.getDate()

  if (month === 11) return true
  if (month === 10) return day >= 15
  if (month === 0) return day <= 6
  return false
}

const FLAKES = Array.from({ length: 24 }, (_, index) => ({
  left: (index * 47 + 11) % 100,
  size: 9 + ((index * 5) % 9),
  duration: 13 + ((index * 7) % 11),
  delay: -((index * 11) % 24),
}))

const LIGHT_COLORS = ['#dc2626', '#f59e0b', '#059669', '#2563eb', '#fde68a']
const LIGHTS = Array.from({ length: 24 }, (_, index) => ({
  color: LIGHT_COLORS[index % LIGHT_COLORS.length],
  delay: (index * 0.17).toFixed(2),
}))

export default function SeasonalDecor() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isDevelopmentPreview = process.env.NODE_ENV === 'development'

    setIsVisible(isHolidaySeason(new Date()) || isDevelopmentPreview)
  }, [])

  if (!isVisible) return null

  return (
    <>
      <div className="seasonal-lights" aria-hidden="true">
        {LIGHTS.map((light) => (
          <span
            key={`${light.color}-${light.delay}`}
            className="seasonal-light"
            style={{
              color: light.color,
              animationDelay: `${light.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="seasonal-snow" aria-hidden="true">
        {FLAKES.map((flake) => (
          <span
            key={flake.left}
            className="seasonal-flake"
            style={{
              left: `${flake.left}%`,
              fontSize: `${flake.size}px`,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
            }}
          >
            ❄
          </span>
        ))}
      </div>
    </>
  )
}

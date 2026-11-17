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

// Wire curve shared by the SVG path and the bulbs so every bulb hangs from the
// exact same point of the catenary. The path is a quadratic curve whose middle
// sags by WIRE_SAG pixels, and y(t) = 4 * WIRE_SAG * t * (1 - t) matches it.
const WIRE_TOP = 2
const WIRE_SAG = 9
const LIGHT_COUNT = 44
const LIGHTS_HEIGHT = WIRE_TOP + WIRE_SAG + 14

// Bulbs repeat this exact order along the string: pink, yellow, blue, green, red.
const LIGHT_COLORS = ['#f472b6', '#facc15', '#60a5fa', '#22c55e', '#ef4444']

const LIGHTS = Array.from({ length: LIGHT_COUNT }, (_, index) => {
  // Half-step offsets keep the first and last bulbs off the screen edges.
  const t = (index + 0.5) / LIGHT_COUNT

  return {
    color: LIGHT_COLORS[index % LIGHT_COLORS.length],
    left: t * 100,
    top: WIRE_TOP + 4 * WIRE_SAG * t * (1 - t),
    // Negative delays start each bulb mid-animation so the string never blinks in sync.
    twinkleDelay: -((index * 0.37) % 3.2),
    twinkleDuration: 2.2 + ((index * 7) % 10) * 0.16,
    swayDelay: -((index * 0.53) % 4),
    swayDuration: 4.8 + ((index * 11) % 10) * 0.24,
  }
})

export default function SeasonalDecor() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isDevelopmentPreview = process.env.NODE_ENV === 'development'

    setIsVisible(isHolidaySeason(new Date()) || isDevelopmentPreview)
  }, [])

  if (!isVisible) return null

  return (
    <>
      <div className="seasonal-lights" aria-hidden="true" style={{ height: LIGHTS_HEIGHT }}>
        <svg
          className="seasonal-wire"
          viewBox={`0 0 100 ${LIGHTS_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <path
            d={`M 0 ${WIRE_TOP} Q 50 ${WIRE_TOP + WIRE_SAG * 2} 100 ${WIRE_TOP}`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {LIGHTS.map((light) => (
          <span
            key={light.left}
            className="seasonal-light"
            style={{
              left: `${light.left}%`,
              top: light.top,
              color: light.color,
            }}
          >
            <span
              className="seasonal-swing"
              style={{
                animationDelay: `${light.swayDelay}s`,
                animationDuration: `${light.swayDuration}s`,
              }}
            >
              <span
                className="seasonal-bulb"
                style={{
                  animationDelay: `${light.twinkleDelay}s`,
                  animationDuration: `${light.twinkleDuration}s`,
                }}
              />
            </span>
          </span>
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

import React, { useEffect, useRef, useState } from 'react'
import { LEVELS, DEBOUNCE_MS } from '../constants/levels'

const styles = {
  section: {
    margin: '0.5rem 0 1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  emoji: {
    fontSize: '26px',
    transition: 'all 0.25s ease',
    display: 'block',
    lineHeight: 1,
  },
  levelName: {
    fontSize: '16px',
    fontWeight: '600',
    transition: 'color 0.3s',
    lineHeight: 1.2,
  },
  levelDesc: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--muted)',
    marginTop: '2px',
  },
  sliderTrack: {
    position: 'relative',
    padding: '6px 0',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  labelText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9.5px',
    color: 'var(--muted)',
    opacity: 0.7,
  },
  debounceWrap: {
    height: '2px',
    background: 'var(--border)',
    borderRadius: '2px',
    marginTop: '10px',
    overflow: 'hidden',
  },
  debounceFill: {
    height: '100%',
    background: 'linear-gradient(to right, var(--accent3), var(--accent), var(--accent2))',
    borderRadius: '2px',
    transition: 'width 0.05s linear',
  },
}

// Inject slider thumb CSS once
const sliderCSS = `
  input[type=range].complexity-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(to right, var(--accent3), var(--accent), var(--accent2));
  }
  input[type=range].complexity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--text);
    border: 3px solid var(--accent);
    box-shadow: 0 0 14px rgba(200,180,255,0.3), 0 2px 8px rgba(0,0,0,0.4);
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  input[type=range].complexity-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 24px rgba(200,180,255,0.5), 0 2px 8px rgba(0,0,0,0.4);
  }
  input[type=range].complexity-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--text);
    border: 3px solid var(--accent);
    cursor: pointer;
  }
`

if (!document.getElementById('slider-style')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'slider-style'
  styleEl.textContent = sliderCSS
  document.head.appendChild(styleEl)
}

export function ComplexitySlider({ value, onChange, isLoading, hasText }) {
  const level = LEVELS[value]
  const [fillWidth, setFillWidth] = useState(0)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceRef = useRef(null)
  const intervalRef = useRef(null)

  // Animate the debounce progress bar whenever slider moves (and there's text)
  const startDebounce = () => {
    if (!hasText) return
    setIsDebouncing(true)
    setFillWidth(0)
    clearInterval(intervalRef.current)

    const start = Date.now()
    intervalRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / DEBOUNCE_MS) * 100)
      setFillWidth(pct)
      if (pct >= 100) {
        clearInterval(intervalRef.current)
        setIsDebouncing(false)
      }
    }, 30)
  }

  const handleChange = (e) => {
    onChange(Number(e.target.value))
    startDebounce()
  }

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <div style={styles.levelBadge}>
          <span style={styles.emoji}>{level.emoji}</span>
          <div>
            <div style={{ ...styles.levelName, color: level.color }}>
              {level.name}
            </div>
            <div style={styles.levelDesc}>{level.desc}</div>
          </div>
        </div>

        {/* Status pill */}
        <StatusPill isLoading={isLoading} isDebouncing={isDebouncing} hasText={hasText} />
      </div>

      <div style={styles.sliderTrack}>
        <input
          type="range"
          className="complexity-slider"
          min={0}
          max={4}
          step={1}
          value={value}
          onChange={handleChange}
        />

        {/* Debounce progress bar — fills up while waiting to fire API */}
        {isDebouncing && (
          <div style={styles.debounceWrap}>
            <div style={{ ...styles.debounceFill, width: `${fillWidth}%` }} />
          </div>
        )}
      </div>

      <div style={styles.labels}>
        {LEVELS.map((l) => (
          <span key={l.value} style={{
            ...styles.labelText,
            color: l.value === value ? l.color : undefined,
            opacity: l.value === value ? 1 : 0.5,
          }}>
            {l.name.split('-')[0].split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  )
}

function StatusPill({ isLoading, isDebouncing, hasText }) {
  let label = 'IDLE'
  let bg = 'rgba(136,132,160,0.12)'
  let color = 'var(--muted)'

  if (isLoading) {
    label = 'REWRITING'
    bg = 'rgba(200,180,255,0.12)'
    color = 'var(--accent)'
  } else if (isDebouncing && hasText) {
    label = 'WAITING'
    bg = 'rgba(127,232,200,0.1)'
    color = 'var(--accent3)'
  }

  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      padding: '3px 10px',
      borderRadius: '20px',
      letterSpacing: '0.08em',
      background: bg,
      color,
      transition: 'all 0.3s',
    }}>
      {label}
    </span>
  )
}

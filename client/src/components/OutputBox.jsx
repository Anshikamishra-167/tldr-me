import React, { useEffect, useRef } from 'react'

const styles = {
  section: {
    borderTop: '1px solid var(--border)',
    paddingTop: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    padding: '4px 12px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'all 0.2s',
  },
  box: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '1.1rem 1.2rem',
    minHeight: '140px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13.5px',
    lineHeight: '1.8',
    color: 'var(--text)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowY: 'auto',
    maxHeight: '400px',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    position: 'relative',
  },
  placeholder: {
    color: 'var(--muted)',
    opacity: 0.4,
    fontStyle: 'italic',
  },
  cursor: {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    background: 'var(--accent)',
    marginLeft: '2px',
    verticalAlign: 'middle',
    animation: 'blink 0.8s ease infinite',
  },
  errorText: {
    color: 'var(--error)',
  },
}

// Inject cursor blink CSS
if (!document.getElementById('cursor-style')) {
  const s = document.createElement('style')
  s.id = 'cursor-style'
  s.textContent = `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`
  document.head.appendChild(s)
}

export function OutputBox({ output, isLoading, error, copied, onCopy }) {
  const boxRef = useRef(null)

  // Auto-scroll to bottom as text streams in
  useEffect(() => {
    if (boxRef.current && isLoading) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight
    }
  }, [output, isLoading])

  const boxStyle = {
    ...styles.box,
    borderColor: error
      ? 'rgba(255,107,107,0.4)'
      : isLoading
        ? 'var(--accent)'
        : output
          ? 'rgba(127,232,200,0.3)'
          : 'var(--border)',
    boxShadow: isLoading
      ? '0 0 0 3px rgba(200,180,255,0.06)'
      : 'none',
  }

  const renderContent = () => {
    if (error) {
      return <span style={styles.errorText}>⚠ {error}</span>
    }
    if (!output && !isLoading) {
      return (
        <span style={styles.placeholder}>
          Your rewritten text will appear here as you move the slider...
        </span>
      )
    }
    return (
      <>
        {output}
        {isLoading && <span style={styles.cursor} />}
      </>
    )
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.label}>rewritten output</span>
        {output && (
          <button
            style={{
              ...styles.copyBtn,
              borderColor: copied ? 'var(--accent3)' : undefined,
              color: copied ? 'var(--accent3)' : undefined,
            }}
            onClick={onCopy}
          >
            {copied ? 'copied!' : 'copy'}
          </button>
        )}
      </div>

      <div ref={boxRef} style={boxStyle}>
        {renderContent()}
      </div>
    </div>
  )
}

import React from 'react'

const styles = {
  wrapper: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '0.6rem',
  },
  textarea: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    lineHeight: '1.75',
    padding: '1rem 1.1rem',
    resize: 'vertical',
    minHeight: '150px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  charCount: {
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--muted)',
    marginTop: '0.4rem',
    opacity: 0.6,
  }
}

export function TextInput({ value, onChange }) {
  const MAX_CHARS = 4000

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.boxShadow = '0 0 0 3px rgba(200,180,255,0.08)'
  }
  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>paste your text</label>
      <textarea
        style={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Paste any article, essay, research paper, Wikipedia page, or dense text here...&#10;&#10;The longer and denser the text, the more impressive the transformation."
        spellCheck={false}
      />
      <div style={styles.charCount}>
        {value.length} / {MAX_CHARS} characters
      </div>
    </div>
  )
}

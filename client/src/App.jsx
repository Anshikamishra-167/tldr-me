import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TextInput } from './components/TextInput'
import { ComplexitySlider } from './components/ComplexitySlider'
import { OutputBox } from './components/OutputBox'
import { useDebounce } from './hooks/useDebounce'
import { DEBOUNCE_MS } from './constants/levels'
 
const styles = {
  app: { maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem', position: 'relative', zIndex: 1 },
  blobLeft: { position: 'fixed', top: '20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(200,180,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  blobRight: { position: 'fixed', bottom: '10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,157,226,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  header: { textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeUp 0.6s ease both' },
  eyebrow: { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.75rem', opacity: 0.8 },
  title: { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', lineHeight: 1.05, fontStyle: 'italic', background: 'linear-gradient(135deg, var(--text) 40%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' },
  subtitle: { color: 'var(--muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', animation: 'fadeUp 0.6s 0.1s ease both', position: 'relative', overflow: 'hidden' },
  cardGlow: { position: 'absolute', top: '-80px', right: '-80px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(200,180,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  divider: { borderTop: '1px solid var(--border)', margin: '1.5rem 0' },
  footer: { textAlign: 'center', marginTop: '2rem', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', opacity: 0.4, animation: 'fadeUp 0.6s 0.25s ease both' },
}
 
if (!document.getElementById('app-style')) {
  const s = document.createElement('style')
  s.id = 'app-style'
  s.textContent = `@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }`
  document.head.appendChild(s)
}
 
export default function App() {
  const [inputText, setInputText] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
 
  const debouncedInput = useDebounce({ text: inputText, level: sliderValue }, DEBOUNCE_MS)
  const abortRef = useRef(null)
 
  const rewrite = useCallback(async (text, level) => {
    if (!text || text.trim().length < 20) return
 
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
 
    setIsLoading(true)
    setError('')
    setOutput('')
 
    try {
      // Calls our Express backend which proxies to Gemini
    const apiUrl = import.meta.env.VITE_API_URL || 'https://tldr-me-server.onrender.com'
const response = await fetch(`${apiUrl}/api/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level }),
        signal: abortRef.current.signal,
      })
 
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `Server error ${response.status} — is the backend running?`)
      }
 
      // Read SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
 
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) setOutput(prev => prev + parsed.text)
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) throw e
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])
 
  useEffect(() => {
    if (debouncedInput.text.trim().length > 20) {
      rewrite(debouncedInput.text, debouncedInput.level)
    }
  }, [debouncedInput, rewrite])
 
  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
 
  return (
    <>
      <div style={styles.blobLeft} />
      <div style={styles.blobRight} />
      <div style={styles.app}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>✦ complexity as a dial</p>
          <h1 style={styles.title}>TL;DR Me</h1>
          <p style={styles.subtitle}>drag the slider · watch the world change</p>
        </header>
        <main style={styles.card}>
          <div style={styles.cardGlow} />
          <TextInput value={inputText} onChange={setInputText} />
          <div style={styles.divider} />
          <ComplexitySlider value={sliderValue} onChange={setSliderValue} isLoading={isLoading} hasText={inputText.trim().length > 20} />
          <OutputBox output={output} isLoading={isLoading} error={error} copied={copied} onCopy={handleCopy} />
        </main>
        <footer style={styles.footer}>
          powered by gemini 2.0 flash · streaming · 100% free
        </footer>
      </div>
    </>
  )
}
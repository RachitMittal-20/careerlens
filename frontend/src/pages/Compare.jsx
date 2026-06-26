import { CheckCircle, Lightbulb, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { compareJDs } from '../services/api'

const cs = (isDark) => ({
  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)',
  borderRadius: '16px',
  boxShadow: isDark
    ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
    : '0 8px 32px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
})

const is = (isDark) => ({
  width: '100%',
  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(209,196,233,0.8)',
  color: isDark ? '#f5f0ff' : '#1e1333',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  outline: 'none',
  resize: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
})

const tc = (isDark) => ({
  primary:   isDark ? '#f5f0ff' : '#1e1333',
  secondary: isDark ? '#c4b5fd' : '#4c1d95',
  label:     isDark ? '#a78bfa' : '#6d28d9',
})

function StyledInput({ isDark, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{ ...is(isDark), ...(focused ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-glow)' } : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function StyledTextarea({ isDark, style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      style={{
        ...is(isDark),
        ...(focused ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-glow)' } : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function Pill({ text, variant = 'purple', isDark }) {
  const styles = {
    purple: { background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.1)', color: isDark ? '#c4b5fd' : '#6d28d9', border: '1px solid rgba(124,58,237,0.25)' },
    violet: { background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' },
    gray:   { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#c4b5fd' : '#4c1d95', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(124,58,237,0.15)' },
  }
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backdropFilter: 'blur(10px)', ...styles[variant] }}>
      {text}
    </span>
  )
}

function OverlapBar({ label, value, isDark }) {
  const c = tc(isDark)
  const pct = Math.round(value * 100)
  const barColor = pct >= 60
    ? 'linear-gradient(90deg, #7c3aed, #a78bfa)'
    : pct >= 40
    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
    : 'linear-gradient(90deg, #dc2626, #ef4444)'

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: c.secondary }}>{label}</span>
        <span className="font-semibold" style={{ color: c.primary, fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.15)' }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  )
}

const EMPTY_JD = { title: '', text: '' }

export default function Compare() {
  const { isDark } = useTheme()
  const { compareResults, setCompareResults } = useApp()
  const c = tc(isDark)
  const CARD = cs(isDark)

  const [jds, setJds]             = useState([{ ...EMPTY_JD }, { ...EMPTY_JD }, { ...EMPTY_JD }])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults]     = useState(() => compareResults)
  const [error, setError]         = useState(null)
  const [copied, setCopied]       = useState(false)

  const updateJD = (i, field, val) =>
    setJds(prev => prev.map((jd, idx) => idx === i ? { ...jd, [field]: val } : jd))

  const filledJDs = jds.filter(jd => jd.text.trim())
  const canCompare = filledJDs.length >= 2 && !isLoading

  const handleCompare = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const texts = jds.filter(j => j.text.trim()).map(j => j.text)
      const { data } = await compareJDs(texts)
      setResults(data)
      setCompareResults(data)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Comparison failed. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  const copyAll = async (keywords) => {
    await navigator.clipboard.writeText(keywords.join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filledWithTitle = jds.map((jd, i) => ({ ...jd, idx: i + 1 })).filter(jd => jd.text.trim())

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: c.primary }}>Multi-JD Comparison</h1>
      <p className="text-sm mb-6" style={{ color: c.label }}>
        Find the keywords that matter most across multiple job descriptions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {jds.map((jd, i) => {
          const isOptional = i === 2
          const isEmpty = !jd.text.trim()
          return (
            <div key={i} style={{ ...CARD, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: isOptional && isEmpty ? 0.6 : 1 }}>
              <h3 className="text-sm font-semibold" style={{ color: c.primary }}>
                JD {i + 1}
                {isOptional && <span className="ml-1 font-normal" style={{ color: c.label }}>(Optional)</span>}
              </h3>
              <StyledInput isDark={isDark} value={jd.title} onChange={e => updateJD(i, 'title', e.target.value)} placeholder={`e.g. ${['Google SWE', 'Meta Backend', 'Startup Engineer'][i]}`} />
              <StyledTextarea isDark={isDark} value={jd.text} onChange={e => updateJD(i, 'text', e.target.value)} placeholder="Paste job description here..." style={{ flex: 1, minHeight: '160px' }} />
            </div>
          )
        })}
      </div>

      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className="w-full py-3 mb-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 4px 24px rgba(124,58,237,0.4)' }}
      >
        {isLoading ? <><Loader2 size={16} className="animate-spin" /> Comparing...</> : 'Compare JDs'}
      </button>

      {error && (
        <div className="mb-6 rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: isDark ? '#fca5a5' : '#dc2626' }}>
          {error}
        </div>
      )}

      {results && (
        <div className="flex flex-col gap-4">
          <div style={{ ...CARD, padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start', border: isDark ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(124,58,237,0.2)' }}>
            <Lightbulb size={18} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
            <p className="text-sm italic" style={{ color: c.secondary }}>{results.recommendation}</p>
          </div>

          <div style={{ ...CARD, padding: '20px' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-semibold" style={{ color: c.primary }}>
                  Universal Keywords
                  <span className="ml-2 text-xs font-normal" style={{ color: c.label }}>appear in all {results.jd_count} JDs</span>
                </h3>
              </div>
              {results.universal_keywords.length > 0 && (
                <button className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--accent)' }} onClick={() => copyAll(results.universal_keywords)}>
                  {copied ? '✓ Copied!' : 'Copy All'}
                </button>
              )}
            </div>
            {results.universal_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">{results.universal_keywords.map(kw => <Pill key={kw} text={kw} variant="purple" isDark={isDark} />)}</div>
            ) : (
              <p className="text-sm" style={{ color: c.label }}>No keywords appear in all job descriptions.</p>
            )}
          </div>

          <div style={{ ...CARD, padding: '20px' }}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold" style={{ color: c.primary }}>Common Keywords</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--accent)' }}>
                {results.common_keywords.length}
              </span>
              <span className="text-xs" style={{ color: c.label }}>appear in 2+ JDs</span>
            </div>
            {results.common_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">{results.common_keywords.map(kw => <Pill key={kw} text={kw} variant="violet" isDark={isDark} />)}</div>
            ) : (
              <p className="text-sm" style={{ color: c.label }}>No common keywords found.</p>
            )}
          </div>

          <div style={{ ...CARD, padding: '20px' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>Overlap Between JDs</h3>
            <div className="flex flex-col gap-3">
              {filledWithTitle.flatMap((a, ai) =>
                filledWithTitle.slice(ai + 1).map((b, bi) => {
                  const overlapVal = results.overlap_matrix[ai][ai + 1 + bi]
                  return <OverlapBar key={`${ai}-${ai + 1 + bi}`} label={`${a.title || `JD ${a.idx}`} vs ${b.title || `JD ${b.idx}`}`} value={overlapVal} isDark={isDark} />
                })
              )}
            </div>
          </div>

          <div style={{ ...CARD, padding: '20px' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>Unique Keywords per JD</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.unique_per_jd.map((kwList, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: c.label }}>{filledWithTitle[i]?.title || `JD ${i + 1}`}</p>
                  {kwList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">{kwList.map(kw => <Pill key={kw} text={kw} variant="gray" isDark={isDark} />)}</div>
                  ) : (
                    <p className="text-xs" style={{ color: c.label }}>No unique keywords</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import {
  BarChart2,
  FileText,
  Loader2,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { analyzeResume } from '../services/api'

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function useAnimatedScore(target) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (target == null) return
    const start = performance.now()
    const duration = 1000
    function frame(now) {
      const elapsed = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(elapsed * target))
      if (elapsed < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [target])
  return display
}

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
  borderRadius: '12px',
  padding: '12px 16px',
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

function StyledInput({ isDark, style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
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

function CategoryBar({ label, value, isDark }) {
  const c = tc(isDark)
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: c.secondary }}>{label}</span>
        <span style={{ color: c.primary, fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.15)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
        />
      </div>
    </div>
  )
}

function KeywordPill({ text, variant, isDark }) {
  const styles = {
    missing: { background: 'rgba(239,68,68,0.1)',   color: isDark ? '#fca5a5' : '#dc2626', border: '1px solid rgba(239,68,68,0.3)' },
    matched: { background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.1)', color: isDark ? '#c4b5fd' : '#6d28d9', border: `1px solid ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}` },
    partial: { background: 'rgba(251,191,36,0.1)',  color: isDark ? '#fde68a' : '#b45309', border: '1px solid rgba(251,191,36,0.3)' },
  }
  return (
    <span
      className="inline-block text-xs px-2 py-1 rounded-full"
      style={{ backdropFilter: 'blur(10px)', ...styles[variant] }}
    >
      {variant === 'matched' ? `✓ ${text}` : text}
    </span>
  )
}

function MissingTab({ missing, isDark }) {
  const c = tc(isDark)
  const high   = missing.filter(k => k.priority === 'high')
  const medium = missing.filter(k => k.priority === 'medium')
  const low    = missing.filter(k => k.priority === 'low')

  const Section = ({ dotColor, glowColor, label, items }) =>
    items.length === 0 ? null : (
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style={{ background: dotColor, boxShadow: `0 0 6px ${glowColor}` }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.label }}>
            {label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map(k => <KeywordPill key={k.keyword} text={k.keyword} variant="missing" isDark={isDark} />)}
        </div>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <Section dotColor="#ef4444" glowColor="rgba(239,68,68,0.5)"   label="High Priority" items={high} />
      <Section dotColor="#eab308" glowColor="rgba(234,179,8,0.5)"   label="Medium"        items={medium} />
      <Section dotColor="#6b7280" glowColor="rgba(107,114,128,0.5)" label="Low"           items={low} />
      {missing.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: c.label }}>
          No missing keywords — great match!
        </p>
      )}
    </div>
  )
}

function KeywordAnalysisCard({ keyword_analysis, isDark }) {
  const [tab, setTab] = useState('missing')
  const { matched, missing, partial } = keyword_analysis
  const c = tc(isDark)

  const tabs = [
    { id: 'missing', label: `Missing (${missing.length})` },
    { id: 'matched', label: `Matched (${matched.length})` },
    { id: 'partial', label: `Partial (${partial.length})` },
  ]

  return (
    <div style={{ ...cs(isDark), padding: '24px' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>Keyword Analysis</h3>
      <div className="flex mb-4 gap-4" style={{ borderBottom: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.15)'}` }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="text-sm pb-2 transition-colors"
            style={{
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--accent)' : c.label,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'missing' && <MissingTab missing={missing} isDark={isDark} />}
      {tab === 'matched' && (
        <div className="flex flex-wrap gap-2">
          {matched.map(k => <KeywordPill key={k.keyword} text={k.keyword} variant="matched" isDark={isDark} />)}
          {matched.length === 0 && <p className="text-sm" style={{ color: c.label }}>No exact matches found.</p>}
        </div>
      )}
      {tab === 'partial' && (
        <div className="flex flex-wrap gap-2">
          {partial.map(k => (
            <KeywordPill key={k.keyword} text={`${k.keyword} (${k.resume_match})`} variant="partial" isDark={isDark} />
          ))}
          {partial.length === 0 && <p className="text-sm" style={{ color: c.label }}>No partial matches.</p>}
        </div>
      )}
    </div>
  )
}

function StatMini({ label, value, isDark }) {
  return (
    <div style={{ ...cs(isDark), padding: '16px', textAlign: 'center' }}>
      <div className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: tc(isDark).label }}>{label}</div>
    </div>
  )
}

export default function Analyzer() {
  const { isDark } = useTheme()
  const { analyzerResults, setAnalyzerResults } = useApp()
  const c = tc(isDark)
  const CARD = cs(isDark)

  const [resumeFile, setResumeFile] = useState(null)
  const [jdText, setJdText]         = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [results, setResults]       = useState(() => analyzerResults)
  const [error, setError]           = useState(null)
  const [dragOver, setDragOver]     = useState(false)

  const fileInputRef = useRef(null)
  const animatedScore = useAnimatedScore(results?.ats_score?.score ?? null)

  const handleFile = useCallback((file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Only PDF, DOCX, or TXT files are supported.')
      return
    }
    setResumeFile(file)
    setError(null)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const handleSubmit = useCallback(async () => {
    if (!resumeFile || !jdText.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await analyzeResume(resumeFile, jdText)
      setResults(data)
      setAnalyzerResults(data)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Analysis failed. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }, [resumeFile, jdText])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSubmit])

  const canSubmit = resumeFile && jdText.trim() && !isLoading

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: c.primary }}>Resume Analyzer</h1>
      <p className="text-sm mb-6" style={{ color: c.label }}>
        Upload your resume and paste a job description to get your ATS score.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <div style={{ ...CARD, padding: '24px' }}>
            <p className="text-sm font-medium mb-3" style={{ color: c.secondary }}>Resume</p>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? 'var(--accent)' : (isDark ? 'rgba(139,92,246,0.3)' : 'rgba(124,58,237,0.25)'),
                background: dragOver ? 'rgba(124,58,237,0.08)' : 'transparent',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText size={32} style={{ color: 'var(--accent)' }} />
                  <p className="text-sm font-medium break-all" style={{ color: c.primary }}>{resumeFile.name}</p>
                  <p className="text-xs" style={{ color: c.label }}>{formatSize(resumeFile.size)}</p>
                  <button
                    className="text-xs mt-1"
                    style={{ color: 'var(--accent)' }}
                    onClick={e => { e.stopPropagation(); setResumeFile(null); fileInputRef.current.value = '' }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2" style={{ color: c.label }}>
                  <Upload size={32} />
                  <p className="text-sm font-medium">Drop your resume here</p>
                  <p className="text-xs">PDF, DOCX, or TXT</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ ...CARD, padding: '24px' }}>
            <p className="text-sm font-medium mb-3" style={{ color: c.secondary }}>Job Description</p>
            <StyledTextarea
              isDark={isDark}
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the job description here..."
              style={{ minHeight: '192px' }}
            />
            <p className="text-xs text-right mt-1" style={{ color: c.label }}>{jdText.length} chars</p>
          </div>

          <div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white',
                border: '1px solid rgba(167,139,250,0.3)',
                boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
              }}
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                : <><Search size={16} /> Analyze Resume</>
              }
            </button>
            <p className="text-xs text-center mt-2" style={{ color: c.label }}>Press Ctrl+Enter to analyze</p>
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: isDark ? '#fca5a5' : '#dc2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {results != null && (
            <div className="flex justify-end">
              <button
                onClick={() => { setResults(null); setAnalyzerResults(null) }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ color: c.label, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
              >
                <X size={11} /> Clear results
              </button>
            </div>
          )}
          {results == null ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
              <BarChart2 size={48} style={{ color: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(124,58,237,0.25)' }} />
              <p className="font-medium" style={{ color: c.label }}>Your analysis will appear here</p>
              <p className="text-sm" style={{ color: c.label }}>Upload a resume and paste a job description to get started</p>
            </div>
          ) : (
            <>
              <div style={{ ...CARD, padding: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: c.primary }}>ATS Score</h3>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(124,58,237,0.1)',
                      border: isDark ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(124,58,237,0.25)',
                      color: 'var(--accent)',
                    }}
                  >
                    {results.ats_score.grade}
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-6xl font-bold leading-none" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {animatedScore}
                  </span>
                  <span className="text-2xl mb-1" style={{ color: c.label }}>/100</span>
                </div>
                <p className="text-sm italic mb-5" style={{ color: c.secondary }}>{results.ats_score.feedback}</p>
                <div className="flex flex-col gap-3">
                  <CategoryBar label="Technical"  value={results.ats_score.technical_score}  isDark={isDark} />
                  <CategoryBar label="Skills"     value={results.ats_score.skills_score}     isDark={isDark} />
                  <CategoryBar label="Experience" value={results.ats_score.experience_score} isDark={isDark} />
                  <CategoryBar label="Education"  value={results.ats_score.education_score}  isDark={isDark} />
                </div>
              </div>

              <KeywordAnalysisCard keyword_analysis={results.keyword_analysis} isDark={isDark} />

              <div className="grid grid-cols-3 gap-3">
                <StatMini isDark={isDark} label="Match Rate"     value={`${Math.round(results.keyword_analysis.match_rate * 100)}%`} />
                <StatMini isDark={isDark} label="Keywords Found" value={`${results.ats_score.matched_count}/${results.ats_score.total_keywords}`} />
                <StatMini isDark={isDark} label="Word Count"     value={results.resume_data.word_count} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

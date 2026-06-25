import {
  BarChart2,
  FileText,
  Loader2,
  Search,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeResume } from '../services/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  C: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  D: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  F: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}

// ---------------------------------------------------------------------------
// Animated score counter
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

function CategoryBar({ label, value, color }) {
  const colorMap = {
    blue:   'bg-blue-500',
    purple: 'bg-purple-500',
    green:  'bg-green-500',
    orange: 'bg-orange-500',
  }
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full ${colorMap[color]} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function KeywordPill({ text, variant }) {
  const styles = {
    missing: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20',
    matched: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20',
    partial: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20',
  }
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded-full ${styles[variant]}`}>
      {variant === 'matched' ? `✓ ${text}` : text}
    </span>
  )
}

function MissingTab({ missing }) {
  const high   = missing.filter(k => k.priority === 'high')
  const medium = missing.filter(k => k.priority === 'medium')
  const low    = missing.filter(k => k.priority === 'low')

  const Section = ({ dot, label, items }) =>
    items.length === 0 ? null : (
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map(k => <KeywordPill key={k.keyword} text={k.keyword} variant="missing" />)}
        </div>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <Section dot="bg-red-500"    label="High Priority" items={high} />
      <Section dot="bg-yellow-500" label="Medium"        items={medium} />
      <Section dot="bg-gray-400"   label="Low"           items={low} />
      {missing.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No missing keywords — great match!</p>
      )}
    </div>
  )
}

function KeywordAnalysisCard({ keyword_analysis }) {
  const [tab, setTab] = useState('missing')
  const { matched, missing, partial } = keyword_analysis

  const tabs = [
    { id: 'missing', label: `Missing (${missing.length})` },
    { id: 'matched', label: `Matched (${matched.length})` },
    { id: 'partial', label: `Partial (${partial.length})` },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Keyword Analysis</h3>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 gap-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'missing' && <MissingTab missing={missing} />}

      {tab === 'matched' && (
        <div className="flex flex-wrap gap-2">
          {matched.map(k => <KeywordPill key={k.keyword} text={k.keyword} variant="matched" />)}
          {matched.length === 0 && <p className="text-sm text-gray-400">No exact matches found.</p>}
        </div>
      )}

      {tab === 'partial' && (
        <div className="flex flex-wrap gap-2">
          {partial.map(k => (
            <KeywordPill key={k.keyword} text={`${k.keyword} (${k.resume_match})`} variant="partial" />
          ))}
          {partial.length === 0 && <p className="text-sm text-gray-400">No partial matches.</p>}
        </div>
      )}
    </Card>
  )
}

function StatMini({ label, value, color }) {
  const colorMap = {
    blue:   'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green:  'text-green-600 dark:text-green-400',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Analyzer() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jdText, setJdText]         = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [results, setResults]       = useState(null)
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Resume Analyzer</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Upload your resume and paste a job description to get your ATS score.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- LEFT COLUMN ---- */}
        <div className="flex flex-col gap-4">

          {/* Resume upload */}
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Resume</p>
            <div
              className={[
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5',
              ].join(' ')}
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
                  <FileText size={32} className="text-green-500" />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{resumeFile.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(resumeFile.size)}</p>
                  <button
                    className="text-xs text-blue-500 hover:text-blue-600 mt-1"
                    onClick={e => { e.stopPropagation(); setResumeFile(null); fileInputRef.current.value = '' }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={32} />
                  <p className="text-sm font-medium">Drop your resume here</p>
                  <p className="text-xs">PDF, DOCX, or TXT</p>
                </div>
              )}
            </div>
          </Card>

          {/* JD textarea */}
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Job Description</p>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full min-h-48 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{jdText.length} chars</p>
          </Card>

          {/* Analyze button */}
          <div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                : <><Search size={16} /> Analyze Resume</>
              }
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Press Ctrl+Enter to analyze</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* ---- RIGHT COLUMN ---- */}
        <div className="flex flex-col gap-4">
          {results == null ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
              <BarChart2 size={48} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-400 font-medium">Your analysis will appear here</p>
              <p className="text-sm text-gray-400">Upload a resume and paste a job description to get started</p>
            </div>
          ) : (
            <>
              {/* ATS Score card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ATS Score</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${GRADE_COLORS[results.ats_score.grade]}`}>
                    {results.ats_score.grade}
                  </span>
                </div>

                <div className="flex items-end gap-1 mb-2">
                  <span className="text-6xl font-bold text-gray-900 dark:text-white leading-none">{animatedScore}</span>
                  <span className="text-2xl text-gray-400 mb-1">/100</span>
                </div>

                <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-5">{results.ats_score.feedback}</p>

                <div className="flex flex-col gap-3">
                  <CategoryBar label="Technical"  value={results.ats_score.technical_score}  color="blue" />
                  <CategoryBar label="Skills"     value={results.ats_score.skills_score}     color="purple" />
                  <CategoryBar label="Experience" value={results.ats_score.experience_score} color="green" />
                  <CategoryBar label="Education"  value={results.ats_score.education_score}  color="orange" />
                </div>
              </Card>

              {/* Keyword Analysis card */}
              <KeywordAnalysisCard keyword_analysis={results.keyword_analysis} />

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatMini
                  label="Match Rate"
                  value={`${Math.round(results.keyword_analysis.match_rate * 100)}%`}
                  color="blue"
                />
                <StatMini
                  label="Keywords Found"
                  value={`${results.ats_score.matched_count}/${results.ats_score.total_keywords}`}
                  color="purple"
                />
                <StatMini
                  label="Word Count"
                  value={results.resume_data.word_count}
                  color="green"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

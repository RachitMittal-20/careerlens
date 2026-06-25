import { CheckCircle, Lightbulb, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { compareJDs } from '../services/api'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

function Pill({ text, variant = 'blue' }) {
  const styles = {
    green: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
    blue:  'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    gray:  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[variant]}`}>{text}</span>
  )
}

function OverlapBar({ label, value }) {
  const pct = Math.round(value * 100)
  const color = pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const EMPTY_JD = { title: '', text: '' }

export default function Compare() {
  const [jds, setJds]           = useState([{ ...EMPTY_JD }, { ...EMPTY_JD }, { ...EMPTY_JD }])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults]   = useState(null)
  const [error, setError]       = useState(null)
  const [copied, setCopied]     = useState(false)

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

  // Build pair labels from filled JD titles
  const filledWithTitle = jds
    .map((jd, i) => ({ ...jd, idx: i + 1 }))
    .filter(jd => jd.text.trim())

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Multi-JD Comparison</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Find the keywords that matter most across multiple job descriptions.
      </p>

      {/* JD inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {jds.map((jd, i) => {
          const isOptional = i === 2
          const isEmpty = !jd.text.trim()
          return (
            <div
              key={i}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${
                isOptional && isEmpty
                  ? 'border-gray-200 dark:border-gray-700 opacity-70'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                JD {i + 1}{isOptional && <span className="ml-1 text-gray-400 font-normal">(Optional)</span>}
              </h3>
              <input
                value={jd.title}
                onChange={e => updateJD(i, 'title', e.target.value)}
                placeholder={`e.g. ${['Google SWE', 'Meta Backend', 'Startup Engineer'][i]}`}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
              <textarea
                value={jd.text}
                onChange={e => updateJD(i, 'text', e.target.value)}
                placeholder="Paste job description here..."
                className="flex-1 min-h-40 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-colors"
              />
            </div>
          )
        })}
      </div>

      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className="w-full py-3 mb-6 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2 transition-all"
      >
        {isLoading
          ? <><Loader2 size={16} className="animate-spin" /> Comparing...</>
          : 'Compare JDs'
        }
      </button>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {results && (
        <div className="flex flex-col gap-4">
          {/* Recommendation */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-5 flex gap-3 items-start">
            <Lightbulb size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm italic text-blue-800 dark:text-blue-300">{results.recommendation}</p>
          </div>

          {/* Universal keywords */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Universal Keywords
                  <span className="ml-2 text-xs font-normal text-gray-400">appear in all {results.jd_count} JDs</span>
                </h3>
              </div>
              {results.universal_keywords.length > 0 && (
                <button
                  onClick={() => copyAll(results.universal_keywords)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Copy All'}
                </button>
              )}
            </div>
            {results.universal_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.universal_keywords.map(kw => <Pill key={kw} text={kw} variant="green" />)}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No keywords appear in all job descriptions.</p>
            )}
          </Card>

          {/* Common keywords */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Common Keywords</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                {results.common_keywords.length}
              </span>
              <span className="text-xs text-gray-400">appear in 2+ JDs</span>
            </div>
            {results.common_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.common_keywords.map(kw => <Pill key={kw} text={kw} variant="blue" />)}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No common keywords found.</p>
            )}
          </Card>

          {/* Overlap stats */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Overlap Between JDs</h3>
            <div className="flex flex-col gap-3">
              {filledWithTitle.flatMap((a, ai) =>
                filledWithTitle.slice(ai + 1).map((b, bi) => {
                  const overlapVal = results.overlap_matrix[ai][ai + 1 + bi]
                  const labelA = a.title || `JD ${a.idx}`
                  const labelB = b.title || `JD ${b.idx}`
                  return (
                    <OverlapBar
                      key={`${ai}-${ai + 1 + bi}`}
                      label={`${labelA} vs ${labelB}`}
                      value={overlapVal}
                    />
                  )
                })
              )}
            </div>
          </Card>

          {/* Unique per JD */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Unique Keywords per JD</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.unique_per_jd.map((kwList, i) => {
                const label = filledWithTitle[i]?.title || `JD ${i + 1}`
                return (
                  <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{label}</p>
                    {kwList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {kwList.map(kw => <Pill key={kw} text={kw} variant="gray" />)}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No unique keywords</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

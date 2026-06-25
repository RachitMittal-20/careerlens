import { Loader2, Plus, Trash2, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { rewriteBullets } from '../services/api'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export default function Rewriter() {
  const [bullets, setBullets]     = useState(['', '', ''])
  const [roleTitle, setRoleTitle] = useState('')
  const [jdKeywords, setJdKeywords] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rewrites, setRewrites]   = useState([])
  const [accepted, setAccepted]   = useState(new Set())
  const [error, setError]         = useState(null)
  const [copied, setCopied]       = useState(false)

  const updateBullet = (i, val) =>
    setBullets(prev => prev.map((b, idx) => (idx === i ? val : b)))

  const removeBullet = (i) =>
    setBullets(prev => prev.filter((_, idx) => idx !== i))

  const addBullet = () => {
    if (bullets.length < 8) setBullets(prev => [...prev, ''])
  }

  const toggleAccepted = (i) =>
    setAccepted(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  const handleRewrite = async () => {
    const filled = bullets.filter(b => b.trim())
    if (!filled.length || !roleTitle.trim()) return
    const kwList = jdKeywords.split(',').map(k => k.trim()).filter(Boolean)
    setIsLoading(true)
    setError(null)
    setAccepted(new Set())
    try {
      const { data } = await rewriteBullets(filled, kwList, roleTitle)
      setRewrites(data.rewrites)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Rewrite failed. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  const copyAccepted = async () => {
    const lines = rewrites
      .filter((_, i) => accepted.has(i))
      .map(r => `• ${r.rewritten}`)
      .join('\n')
    await navigator.clipboard.writeText(lines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filledBullets = bullets.filter(b => b.trim()).length
  const canSubmit = filledBullets > 0 && roleTitle.trim() && !isLoading

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Bullet Point Rewriter</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Paste weak bullet points, get AI-powered rewrites with JD keywords embedded.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — inputs */}
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Job Context</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Job Title</label>
                <input
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Data Scientist"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Job Keywords</label>
                <textarea
                  rows={3}
                  value={jdKeywords}
                  onChange={e => setJdKeywords(e.target.value)}
                  placeholder="Paste keywords comma-separated, e.g. Python, FastAPI, Docker, AWS"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-colors"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Your Bullet Points
              <span className="ml-2 text-xs font-normal text-gray-400">({bullets.length}/8)</span>
            </h3>
            <div className="flex flex-col gap-3">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2.5 text-xs font-bold text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
                  <textarea
                    rows={2}
                    value={b}
                    onChange={e => updateBullet(i, e.target.value)}
                    placeholder="e.g. Worked on backend APIs for the product team"
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-colors"
                  />
                  <button
                    onClick={() => removeBullet(i)}
                    className="mt-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {bullets.length < 8 && (
              <button
                onClick={addBullet}
                className="mt-3 w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={14} /> Add Bullet Point
              </button>
            )}
          </Card>

          <button
            onClick={handleRewrite}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            {isLoading
              ? <><Loader2 size={16} className="animate-spin" /> Rewriting...</>
              : <><Wand2 size={16} /> Rewrite All</>
            }
          </button>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — results */}
        <div className="flex flex-col gap-4">
          {rewrites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
              <Wand2 size={48} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-400 font-medium">Rewrites will appear here</p>
              <p className="text-sm text-gray-400">Fill in your bullets and click Rewrite All</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{accepted.size}</span> of{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{rewrites.length}</span> bullets accepted
                </p>
                {accepted.size > 0 && (
                  <button
                    onClick={copyAccepted}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy Accepted Bullets'}
                  </button>
                )}
              </div>

              {rewrites.map((r, i) => {
                const isAccepted = accepted.has(i)
                return (
                  <div
                    key={i}
                    className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-colors ${
                      isAccepted
                        ? 'border-green-400 dark:border-green-500/60'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">BULLET #{i + 1}</span>
                      {isAccepted && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                          ✓ Accepted
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-400 mb-1.5">Original</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{r.original}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${isAccepted ? 'bg-green-50 dark:bg-green-500/10' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
                        <p className="text-xs font-semibold text-gray-400 mb-1.5">Rewritten</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{r.rewritten}</p>
                      </div>
                    </div>

                    {r.keywords_added?.length > 0 && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                        {r.keywords_added.map(kw => (
                          <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                            +{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex gap-2">
                      <button
                        onClick={() => toggleAccepted(i)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          isAccepted
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'
                        }`}
                      >
                        {isAccepted ? '✗ Undo' : '✓ Accept'}
                      </button>
                    </div>
                  </div>
                )
              })}

              {accepted.size > 0 && (
                <button
                  onClick={copyAccepted}
                  className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Copy Accepted Bullets'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

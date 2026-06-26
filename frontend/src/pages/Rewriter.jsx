import { ArrowRight, Loader2, Plus, Trash2, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { rewriteBullets } from '../services/api'

function loadInputs() {
  try {
    const s = sessionStorage.getItem('careerlens-rewriter-inputs')
    return s ? JSON.parse(s) : null
  } catch { return null }
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

export default function Rewriter() {
  const { isDark } = useTheme()
  const { rewriteResults, setRewriteResults, acceptedBullets, setAcceptedBullets } = useApp()
  const navigate = useNavigate()
  const c = tc(isDark)
  const CARD = cs(isDark)

  const _saved = loadInputs()
  const [bullets, setBullets]       = useState(() => _saved?.bullets    || ['', '', ''])
  const [roleTitle, setRoleTitle]   = useState(() => _saved?.roleTitle  || '')
  const [jdKeywords, setJdKeywords] = useState(() => _saved?.jdKeywords || '')
  const [isLoading, setIsLoading]   = useState(false)
  const [rewrites, setRewrites]     = useState(() => rewriteResults?.rewrites || [])
  const [accepted, setAccepted]     = useState(new Set())
  const [error, setError]           = useState(null)
  const [copied, setCopied]         = useState(false)

  useEffect(() => {
    try {
      sessionStorage.setItem('careerlens-rewriter-inputs', JSON.stringify({ bullets, roleTitle, jdKeywords }))
    } catch {}
  }, [bullets, roleTitle, jdKeywords])

  const updateBullet = (i, val) =>
    setBullets(prev => prev.map((b, idx) => (idx === i ? val : b)))

  const removeBullet = (i) =>
    setBullets(prev => prev.filter((_, idx) => idx !== i))

  const addBullet = () => {
    if (bullets.length < 8) setBullets(prev => [...prev, ''])
  }

  const toggleAccepted = (i) => {
    setAccepted(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      // Sync full {original, rewritten} objects to context
      const updated = rewrites
        .filter((_, idx) => next.has(idx))
        .map(r => ({ original: r.original, rewritten: r.rewritten }))
      setAcceptedBullets(updated)
      return next
    })
  }

  const handleRewrite = async () => {
    const filled = bullets.filter(b => b.trim())
    if (!filled.length || !roleTitle.trim()) return
    const kwList = jdKeywords.split(',').map(k => k.trim()).filter(Boolean)
    setIsLoading(true)
    setError(null)
    setAccepted(new Set())
    setAcceptedBullets([])
    try {
      const { data } = await rewriteBullets(filled, kwList, roleTitle)
      setRewrites(data.rewrites)
      setRewriteResults({ rewrites: data.rewrites })
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
      <h1 className="text-2xl font-bold mb-1" style={{ color: c.primary }}>Bullet Point Rewriter</h1>
      <p className="text-sm mb-6" style={{ color: c.label }}>
        Paste weak bullet points, get AI-powered rewrites with JD keywords embedded.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <div style={{ ...CARD, padding: '24px' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>Job Context</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: c.secondary }}>Job Title</label>
                <StyledInput
                  isDark={isDark}
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Data Scientist"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: c.secondary }}>Job Keywords</label>
                <StyledTextarea
                  isDark={isDark}
                  rows={3}
                  value={jdKeywords}
                  onChange={e => setJdKeywords(e.target.value)}
                  placeholder="Paste keywords comma-separated, e.g. Python, FastAPI, Docker, AWS"
                />
              </div>
            </div>
          </div>

          <div style={{ ...CARD, padding: '24px' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>
              Your Bullet Points
              <span className="ml-2 text-xs font-normal" style={{ color: c.label }}>({bullets.length}/8)</span>
            </h3>
            <div className="flex flex-col gap-3">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2.5 text-xs font-bold w-5 text-right shrink-0" style={{ color: c.label }}>
                    {i + 1}
                  </span>
                  <StyledTextarea
                    isDark={isDark}
                    rows={2}
                    value={b}
                    onChange={e => updateBullet(i, e.target.value)}
                    placeholder="e.g. Worked on backend APIs for the product team"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => removeBullet(i)}
                    className="mt-2 p-1.5 rounded-lg transition-colors"
                    style={{ color: c.label }}
                    onMouseOver={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseOut={e => e.currentTarget.style.color = c.label}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {bullets.length < 8 && (
              <button
                onClick={addBullet}
                className="mt-3 w-full rounded-lg py-2 text-sm flex items-center justify-center gap-2 transition-all"
                style={{ border: '1px dashed rgba(124,58,237,0.3)', color: c.label, background: 'transparent' }}
              >
                <Plus size={14} /> Add Bullet Point
              </button>
            )}
          </div>

          <button
            onClick={handleRewrite}
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
              ? <><Loader2 size={16} className="animate-spin" /> Rewriting...</>
              : <><Wand2 size={16} /> Rewrite All</>
            }
          </button>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: isDark ? '#fca5a5' : '#dc2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {rewrites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
              <Wand2 size={48} style={{ color: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(124,58,237,0.25)' }} />
              <p className="font-medium" style={{ color: c.label }}>Rewrites will appear here</p>
              <p className="text-sm" style={{ color: c.label }}>Fill in your bullets and click Rewrite All</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: c.label }}>
                  <span className="font-semibold" style={{ color: c.primary }}>{accepted.size}</span>
                  {' '}of{' '}
                  <span className="font-semibold" style={{ color: c.primary }}>{rewrites.length}</span>
                  {' '}bullets accepted
                </p>
                {accepted.size > 0 && (
                  <button
                    onClick={copyAccepted}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--accent)' }}
                  >
                    {copied ? '✓ Copied!' : 'Copy Accepted Bullets'}
                  </button>
                )}
              </div>

              {rewrites.map((r, i) => {
                const isAccepted = accepted.has(i)
                const cardBase = cs(isDark)
                return (
                  <div
                    key={i}
                    style={{
                      ...cardBase,
                      border: isAccepted
                        ? (isDark ? '2px solid rgba(167,139,250,0.5)' : '2px solid rgba(124,58,237,0.4)')
                        : cardBase.border,
                    }}
                  >
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <span className="text-xs font-bold" style={{ color: c.label, fontFamily: "'JetBrains Mono', monospace" }}>
                        BULLET #{i + 1}
                      </span>
                      {isAccepted && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.1)', color: isDark ? '#c4b5fd' : '#6d28d9', border: '1px solid rgba(124,58,237,0.25)' }}
                        >
                          ✓ Accepted
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                      <div className="rounded-lg p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.04)' }}>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: c.label }}>Original</p>
                        <p className="text-xs leading-relaxed" style={{ color: c.secondary }}>{r.original}</p>
                      </div>
                      <div
                        className="rounded-lg p-3"
                        style={{ background: isAccepted ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)' }}
                      >
                        <p className="text-xs font-semibold mb-1.5" style={{ color: c.label }}>Rewritten</p>
                        <p className="text-xs leading-relaxed" style={{ color: c.primary }}>{r.rewritten}</p>
                      </div>
                    </div>

                    {r.keywords_added?.length > 0 && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                        {r.keywords_added.map(kw => (
                          <span
                            key={kw}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: isDark ? '#c4b5fd' : '#6d28d9' }}
                          >
                            +{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="px-4 py-2.5 flex gap-2" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)'}` }}>
                      <button
                        onClick={() => toggleAccepted(i)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background: isAccepted ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : 'rgba(124,58,237,0.1)',
                          color: isAccepted ? c.label : (isDark ? '#c4b5fd' : '#6d28d9'),
                          border: isAccepted ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` : '1px solid rgba(124,58,237,0.25)',
                        }}
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
                  className="w-full py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)', color: c.secondary }}
                >
                  {copied ? '✓ Copied!' : 'Copy Accepted Bullets'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Export banner */}
      {acceptedBullets.length > 0 && (
        <button
          onClick={() => navigate('/export')}
          className="mt-6 w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all"
          style={{
            background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
            border: isDark ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(124,58,237,0.25)',
          }}
        >
          <span className="text-sm font-medium" style={{ color: isDark ? '#c4b5fd' : '#6d28d9' }}>
            ✓ {acceptedBullets.length} bullet{acceptedBullets.length !== 1 ? 's' : ''} saved — go to Export to download your optimized resume
          </span>
          <ArrowRight size={16} style={{ color: isDark ? '#a78bfa' : '#7c3aed', flexShrink: 0 }} />
        </button>
      )}
    </div>
  )
}

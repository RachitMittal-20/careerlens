import { CheckCircle, Download, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { exportPDF } from '../services/api'

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

const ATS_TIPS = [
  'Use standard section headers (EXPERIENCE, EDUCATION, SKILLS)',
  'Avoid tables, columns, and text boxes',
  'Use standard fonts only',
  'Include keywords naturally in context',
]

export default function Export() {
  const { isDark } = useTheme()
  const c = tc(isDark)
  const CARD = cs(isDark)

  const [resumeText, setResumeText]       = useState('')
  const [filename, setFilename]           = useState('resume')
  const [isExporting, setIsExporting]     = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [error, setError]                 = useState(null)

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0

  const handleExport = async () => {
    if (!resumeText.trim()) return
    setIsExporting(true)
    setError(null)
    try {
      const resumeData = {
        raw_text: resumeText,
        sections: { summary: '', experience: '', skills: '', education: '', projects: '' },
        word_count: wordCount,
        filename: `${filename}.txt`,
      }
      const response = await exportPDF(resumeData, [], filename)
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}_optimized.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Export failed. Is the backend running?')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: c.primary }}>Export Optimized PDF</h1>
      <p className="text-sm mb-6" style={{ color: c.label }}>
        Generate an ATS-friendly PDF from your resume text.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <div style={{ ...CARD, padding: '24px' }}>
            <label className="text-sm font-medium mb-3 block" style={{ color: c.secondary }}>Resume Text</label>
            <StyledTextarea
              isDark={isDark}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder={`Paste your full resume text here. The PDF will be structured automatically.\n\nExample:\nJane Smith\njane@email.com | +1-555-0100\n\nEXPERIENCE\nSoftware Engineer at Acme Corp (2022-2024)\nBuilt REST APIs serving 100K users...\n\nSKILLS\nPython, FastAPI, Docker, PostgreSQL`}
              style={{ minHeight: '384px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}
            />
            <p className="text-xs mt-2" style={{ color: c.label }}>{wordCount} words</p>
          </div>

          <div style={{ ...CARD, padding: '20px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <h3 className="text-sm font-semibold" style={{ color: c.primary }}>ATS Optimization Tips</h3>
            </div>
            <div className="flex flex-col gap-2">
              {ATS_TIPS.map(tip => (
                <div key={tip} className="flex items-start gap-2">
                  <CheckCircle size={14} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: c.secondary }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <div style={{ ...CARD, padding: '24px' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>Export Settings</h3>

            <div className="mb-4">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: c.secondary }}>
                Output Filename{' '}
                <span className="font-normal" style={{ color: c.label }}>(without .pdf)</span>
              </label>
              <StyledInput
                isDark={isDark}
                value={filename}
                onChange={e => setFilename(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_'))}
                placeholder="resume"
              />
              <p className="text-xs mt-1" style={{ color: c.label }}>
                File will be saved as:{' '}
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{filename || 'resume'}_optimized.pdf</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: c.secondary }}>Template</label>
              <div className="rounded-xl p-4" style={{ border: '2px solid var(--accent)', background: 'rgba(124,58,237,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>ATS Optimized</p>
                    <p className="text-xs mt-0.5" style={{ color: c.label }}>Single-column, standard fonts</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--accent)' }}>
                    Recommended
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <p className="text-xs" style={{ color: isDark ? '#fde68a' : '#b45309' }}>
                This PDF uses standard fonts and single-column layout for maximum ATS compatibility.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: isDark ? '#fca5a5' : '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={!resumeText.trim() || isExporting}
            className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: exportSuccess
                ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: 'white',
              border: '1px solid rgba(167,139,250,0.3)',
              boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
            }}
          >
            {isExporting ? (
              <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
            ) : exportSuccess ? (
              <><CheckCircle size={18} /> Downloaded!</>
            ) : (
              <><Download size={18} /> Download PDF</>
            )}
          </button>

          <div style={{ ...CARD, padding: '16px' }}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: c.label }}>
              What gets generated
            </h4>
            <ul className="flex flex-col gap-1.5">
              {[
                'Name extracted from first line',
                'Email & phone parsed automatically',
                'Sections detected by standard headers',
                'Clean A4 layout, Helvetica font',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: c.secondary }}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--accent)', boxShadow: '0 0 4px var(--accent-glow)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

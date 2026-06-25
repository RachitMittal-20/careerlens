import { CheckCircle, Download, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { exportPDF } from '../services/api'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

const ATS_TIPS = [
  'Use standard section headers (EXPERIENCE, EDUCATION, SKILLS)',
  'Avoid tables, columns, and text boxes',
  'Use standard fonts only',
  'Include keywords naturally in context',
]

export default function Export() {
  const [resumeText, setResumeText]     = useState('')
  const [filename, setFilename]         = useState('resume')
  const [isExporting, setIsExporting]   = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [error, setError]               = useState(null)

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0

  const handleExport = async () => {
    if (!resumeText.trim()) return
    setIsExporting(true)
    setError(null)
    try {
      // Build a minimal resume_data structure from plain text
      const resumeData = {
        raw_text: resumeText,
        sections: {
          summary: '',
          experience: '',
          skills: '',
          education: '',
          projects: '',
        },
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Export Optimized PDF</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Generate an ATS-friendly PDF from your resume text.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — resume input */}
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder={`Paste your full resume text here. The PDF will be structured automatically.\n\nExample:\nJane Smith\njane@email.com | +1-555-0100\n\nEXPERIENCE\nSoftware Engineer at Acme Corp (2022-2024)\nBuilt REST APIs serving 100K users...\n\nSKILLS\nPython, FastAPI, Docker, PostgreSQL`}
              className="w-full min-h-96 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-mono transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2">{wordCount} words</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} className="text-blue-500 shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ATS Optimization Tips</h3>
            </div>
            <div className="flex flex-col gap-2">
              {ATS_TIPS.map(tip => (
                <div key={tip} className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT — export options */}
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Export Settings</h3>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                Output Filename <span className="text-gray-400 font-normal">(without .pdf)</span>
              </label>
              <input
                value={filename}
                onChange={e => setFilename(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_'))}
                placeholder="resume"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">File will be saved as: <span className="font-mono">{filename || 'resume'}_optimized.pdf</span></p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Template</label>
              <div className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 cursor-default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">ATS Optimized</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Single-column, standard fonts</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    Recommended
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This PDF uses standard fonts and single-column layout for maximum ATS compatibility.
              </p>
            </div>
          </Card>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={!resumeText.trim() || isExporting}
            className={`w-full py-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              exportSuccess
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isExporting ? (
              <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
            ) : exportSuccess ? (
              <><CheckCircle size={18} /> Downloaded!</>
            ) : (
              <><Download size={18} /> Download PDF</>
            )}
          </button>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              What gets generated
            </h4>
            <ul className="flex flex-col gap-1.5">
              {[
                'Name extracted from first line',
                'Email & phone parsed automatically',
                'Sections detected by standard headers',
                'Clean A4 layout, Helvetica font',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
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

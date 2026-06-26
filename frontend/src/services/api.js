import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

export function analyzeResume(file, jdText) {
  const form = new FormData()
  form.append('file', file)
  form.append('jd_text', jdText)
  return api.post('/api/analyze', form)
}

export function rewriteBullets(bullets, jdKeywords, roleTitle) {
  return api.post('/api/rewrite', {
    bullets,
    jd_keywords: jdKeywords,
    role_title: roleTitle,
  })
}

export function compareJDs(jdTexts) {
  return api.post('/api/compare', { jd_texts: jdTexts })
}

export function exportPDF(resumeData, optimizedBullets = [], filename = 'resume') {
  return api.post(
    '/api/export',
    { resume_data: resumeData, optimized_bullets: optimizedBullets, filename },
    { responseType: 'blob' },
  )
}

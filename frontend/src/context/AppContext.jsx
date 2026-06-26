import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [analyzerResults, setAnalyzerResultsState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('careerlens-analyzer')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const [rewriteResults, setRewriteResultsState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('careerlens-rewriter')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const [compareResults, setCompareResultsState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('careerlens-compare')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const setAnalyzerResults = (data) => {
    setAnalyzerResultsState(data)
    try { sessionStorage.setItem('careerlens-analyzer', JSON.stringify(data)) } catch {}
  }

  const setRewriteResults = (data) => {
    setRewriteResultsState(data)
    try { sessionStorage.setItem('careerlens-rewriter', JSON.stringify(data)) } catch {}
  }

  const setCompareResults = (data) => {
    setCompareResultsState(data)
    try { sessionStorage.setItem('careerlens-compare', JSON.stringify(data)) } catch {}
  }

  const clearAll = () => {
    setAnalyzerResultsState(null)
    setRewriteResultsState(null)
    setCompareResultsState(null)
    sessionStorage.removeItem('careerlens-analyzer')
    sessionStorage.removeItem('careerlens-rewriter')
    sessionStorage.removeItem('careerlens-compare')
    sessionStorage.removeItem('careerlens-rewriter-inputs')
  }

  return (
    <AppContext.Provider value={{
      analyzerResults, setAnalyzerResults,
      rewriteResults, setRewriteResults,
      compareResults, setCompareResults,
      clearAll,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

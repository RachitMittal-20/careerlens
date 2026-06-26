import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Analyzer from './pages/Analyzer'
import Compare from './pages/Compare'
import Export from './pages/Export'
import Rewriter from './pages/Rewriter'

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"         element={<Analyzer />} />
            <Route path="/rewriter" element={<Rewriter />} />
            <Route path="/compare"  element={<Compare />} />
            <Route path="/export"   element={<Export />} />
          </Route>
        </Routes>
      </AppProvider>
    </ThemeProvider>
  )
}

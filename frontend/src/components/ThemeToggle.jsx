import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="glass glass-hover rounded-full p-2 transition-all"
      style={{ color: 'var(--accent)' }}
      aria-label="Toggle theme"
    >
      <span
        className="block transition-transform duration-300"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  )
}

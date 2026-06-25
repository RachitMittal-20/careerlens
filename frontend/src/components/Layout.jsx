import { Download, GitCompare, Pencil, Search } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import AnimatedBackground from './AnimatedBackground'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/',         label: 'Analyzer', icon: Search },
  { to: '/rewriter', label: 'Rewriter', icon: Pencil },
  { to: '/compare',  label: 'Compare',  icon: GitCompare },
  { to: '/export',   label: 'Export',   icon: Download },
]

function NavItem({ to, label, Icon, isDark }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
      style={({ isActive }) => ({
        color: isActive
          ? (isDark ? '#c4b5fd' : '#6d28d9')
          : (isDark ? '#a78bfa' : '#4c1d95'),
        background: isActive
          ? (isDark ? 'rgba(139,92,246,0.15)' : 'rgba(124,58,237,0.1)')
          : 'transparent',
        border: isActive
          ? (isDark ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(124,58,237,0.25)')
          : '1px solid transparent',
        fontWeight: isActive ? 500 : 400,
      })}
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()

  return (
    <>
      <AnimatedBackground />

      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          height: '100vh',
          position: 'fixed',
          top: 0, left: 0,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}>
          {/* Logo row */}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="font-semibold" style={{ color: isDark ? '#f5f0ff' : '#1e1333' }}>
              🎯 CareerLens
            </span>
            <ThemeToggle />
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-2 flex-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavItem key={to} to={to} label={label} Icon={Icon} isDark={isDark} />
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3">
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: isDark ? '#a78bfa' : '#6d28d9',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              v1.0.0
            </span>
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            marginLeft: '240px',
            minHeight: '100vh',
            padding: '2rem',
            flex: 1,
            overflowY: 'auto',
            background: 'transparent',
          }}
        >
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            <div key={pathname} className="page-fade">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

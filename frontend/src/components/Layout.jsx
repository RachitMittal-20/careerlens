import { Download, GitCompare, Pencil, Search } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/',         label: 'Analyzer', icon: Search },
  { to: '/rewriter', label: 'Rewriter', icon: Pencil },
  { to: '/compare',  label: 'Compare',  icon: GitCompare },
  { to: '/export',   label: 'Export',   icon: Download },
]

function NavItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
        ].join(' ')
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 py-4">
          <span className="font-bold text-gray-900 dark:text-white">🎯 CareerLens</span>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3">
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8 dark:bg-gray-900">
        <div key={pathname} className="page-fade">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

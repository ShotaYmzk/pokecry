'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, SwordIcon, BookIcon, TrainingIcon } from './Icons'

export const Navigation = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { path: '/', label: 'ホーム', icon: HomeIcon },
    { path: '/quiz', label: 'バトル', icon: SwordIcon },
    { path: '/list', label: '図鑑', icon: BookIcon },
    { path: '/weak', label: '育成', icon: TrainingIcon },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-gray-200 pb-6 pt-2 z-50">
        <div className="flex justify-around items-center px-2">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center p-2 w-full transition-colors duration-200 ${
                  active ? 'text-accent' : 'text-secondary hover:text-primary'
                }`}
              >
                <item.icon className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Left Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-gray-200 flex-col p-6 z-50">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-primary text-surface rounded-lg flex items-center justify-center text-lg">P</span>
            PokeWav
          </h1>
        </div>

        <div className="space-y-2 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-accent/10 text-accent font-medium' 
                    : 'text-secondary hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[2px] group-hover:scale-110 transition-transform'}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-secondary">
            © 2026 PokeWav
          </p>
        </div>
      </nav>
    </>
  )
}

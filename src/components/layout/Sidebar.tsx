import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Kanban,
  FolderOpen,
  Sparkles,
  FileCheck2,
  BarChart3,
  Layers3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '账号总览' },
  { to: '/planning', icon: Calendar, label: '栏目规划' },
  { to: '/kanban', icon: Kanban, label: '任务看板' },
  { to: '/materials', icon: FolderOpen, label: '素材中心' },
  { to: '/draft', icon: Sparkles, label: '智能草稿' },
  { to: '/review', icon: FileCheck2, label: '审校发布' },
  { to: '/analytics', icon: BarChart3, label: '效果分析' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 h-screen flex flex-col bg-brand-900 text-white fixed left-0 top-0">
      <div className="px-5 py-5 border-b border-brand-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-copper-500 flex items-center justify-center">
            <Layers3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold leading-tight">
              <span className="text-copper-400">内容矩阵</span>
            </div>
            <div className="text-xs text-brand-300 font-medium tracking-wider">
              ContentMatrix
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-copper-600 text-white shadow-lg shadow-copper-900/30'
                  : 'text-brand-200 hover:bg-brand-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer">
          <Avatar emoji="👨‍💼" size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">陈主编</div>
            <div className="text-xs text-brand-300 truncate">内容总监</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

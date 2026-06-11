import { useState } from 'react'
import { Search, Bell, Settings, ChevronDown, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-ink-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="搜索内容、任务、素材..."
            className="w-full pl-10 pr-4 py-2.5 bg-ink-50 border border-ink-100 rounded-lg text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-6">
        <button className="relative w-10 h-10 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-copper-500" />
        </button>

        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="relative ml-2">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-ink-50 transition-colors"
          >
            <Avatar emoji="👨‍💼" size="sm" />
            <ChevronDown
              className={cn(
                'w-4 h-4 text-ink-500 transition-transform duration-200',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-ink-100 py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-ink-50">
                <div className="text-sm font-medium text-ink-800">陈主编</div>
                <div className="text-xs text-ink-500">chen@contentmatrix.com</div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                <User className="w-4 h-4" />
                个人设置
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                <Settings className="w-4 h-4" />
                账号管理
              </button>
              <div className="border-t border-ink-50 my-1" />
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

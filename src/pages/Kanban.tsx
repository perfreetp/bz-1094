import { useState, useMemo } from 'react';
import { Search, CalendarDays, Plus, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn, formatDate, getPriorityText } from '@/lib/utils';
import type { Task } from '@/types';

const columns = [
  { key: 'todo', label: '待撰写', color: 'bg-ink-500' },
  { key: 'writing', label: '撰写中', color: 'bg-copper-500' },
  { key: 'review', label: '待审核', color: 'bg-brand-500' },
  { key: 'scheduled', label: '待发布', color: 'bg-blue-500' },
  { key: 'published', label: '已发布', color: 'bg-emerald-500' },
  { key: 'archived', label: '已归档', color: 'bg-gray-400' },
] as const;

const priorityVariants: Record<string, 'danger' | 'warning' | 'success'> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

export default function Kanban() {
  const { tasks, articles, accounts, users, updateTaskStatus } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getTaskAccountId = (task: Task) => {
    const article = articles.find((a) => a.id === task.articleId);
    return article?.accountId || task.accountId;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchKeyword && !task.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }
      if (selectedAccountId !== 'all' && getTaskAccountId(task) !== selectedAccountId) {
        return false;
      }
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) {
        return false;
      }
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }
      return true;
    });
  }, [tasks, articles, searchKeyword, selectedAccountId, selectedAssignee, selectedPriority]);

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const getAccountName = (accountId?: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || '未关联';
  };

  const getUser = (userName: string) => {
    return users.find((u) => u.name === userName);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, columnKey as Task['status']);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">任务看板</h1>
        <p className="text-sm text-ink-500 mt-1">查看和管理所有内容任务</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="搜索任务标题..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-base pl-9"
            />
          </div>

          <div className="relative">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="input-base pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">全部账号</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="input-base pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">全部负责人</option>
              {users.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="input-base pr-8 appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="all">全部优先级</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
        </div>
      </Card>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.key);
          return (
            <div
              key={column.key}
              className={cn(
                'flex-shrink-0 w-72 flex flex-col rounded-xl transition-all duration-200',
                dragOverColumn === column.key && 'ring-2 ring-brand-500 ring-offset-2 bg-brand-50'
              )}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className="flex items-center gap-2 px-3 py-2 mb-3">
                <div className={cn('w-3 h-3 rounded-full', column.color)} />
                <h3 className="font-semibold text-ink-800">{column.label}</h3>
                <Badge variant="default">{columnTasks.length}</Badge>
              </div>

              <div className="flex-1 space-y-3 min-h-[400px]">
                {columnTasks.map((task, index) => {
                  const user = getUser(task.assignee);
                  return (
                    <Card
                      key={task.id}
                      variant="hover"
                      className={cn(
                        'p-3 cursor-grab active:cursor-grabbing transition-all duration-200',
                        draggedTaskId === task.id && 'opacity-50 rotate-2',
                        'animate-stagger'
                      )}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={priorityVariants[task.priority]}>
                          {getPriorityText(task.priority)}
                        </Badge>
                        <span className="text-xs text-ink-500">{getAccountName(getTaskAccountId(task))}</span>
                      </div>

                      <h4 className="font-medium text-ink-800 text-sm line-clamp-2 mb-3">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            emoji={user?.avatar}
                            alt={task.assignee}
                            size="sm"
                          />
                          <span className="text-xs text-ink-600">{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-ink-500">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>

                      <ProgressBar
                        value={task.progress ?? 0}
                        variant={column.key === 'writing' ? 'copper' : 'brand'}
                        size="sm"
                      />
                    </Card>
                  );
                })}

                <button className="w-full py-3 border-2 border-dashed border-ink-200 rounded-lg text-ink-400 hover:border-brand-400 hover:text-brand-600 transition-all duration-200 flex items-center justify-center gap-1 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

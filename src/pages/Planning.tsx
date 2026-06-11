import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { formatDate, getPriorityColor, getStatusText, cn } from '@/lib/utils';
import type { Article } from '@/types';

const getPriorityBorderColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'border-l-red-400';
    case 'medium':
      return 'border-l-amber-400';
    case 'low':
      return 'border-l-gray-400';
  }
};

export default function Planning() {
  const { articles, users, currentUser, claimArticle } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-01'));
  const [activeTab, setActiveTab] = useState<'all' | 'unclaimed' | 'claimed'>('all');

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getArticlesForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return articles.filter((a) => a.publishDate === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date('2026-06-12');
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const filteredArticles = useMemo(() => {
    switch (activeTab) {
      case 'unclaimed':
        return articles.filter((a) => !a.assignee || a.status === 'draft');
      case 'claimed':
        return articles.filter((a) => a.assignee && a.status !== 'draft');
      default:
        return articles;
    }
  }, [articles, activeTab]);

  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredArticles]);

  const getArticleAssigneeUser = (article: Article) => {
    return users.find((u) => u.name === article.assignee) || users.find((u) => u.id === article.assignee);
  };

  const handleClaim = (articleId: string) => {
    claimArticle(articleId, currentUser.id);
  };

  const ArticleMiniCard = ({ article }: { article: Article }) => {
    return (
      <div
        className={cn(
          'text-xs border-l-2 bg-ink-50 rounded-r px-2 py-1 truncate',
          getPriorityBorderColor(article.priority)
        )}
      >
        <span className="text-ink-700 truncate">
          {article.title.length > 8 ? article.title.slice(0, 8) + '…' : article.title}
        </span>
      </div>
    );
  };

  const ArticlePoolCard = ({ article }: { article: Article }) => {
    const assigneeUser = getArticleAssigneeUser(article);
    const isClaimed = !!article.assignee && article.status !== 'draft';

    return (
      <Card className="p-4 animate-stagger">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-ink-800 text-sm flex-1 mr-2 line-clamp-2">
            {article.title}
          </h4>
          <Badge variant={article.priority === 'high' ? 'danger' : article.priority === 'medium' ? 'warning' : 'default'}>
            {article.priority === 'high' ? '高优' : article.priority === 'medium' ? '中优' : '低优'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-brand-50 text-brand-700">
            {article.category}
          </span>
          <span className="text-xs text-ink-400">
            {formatDate(article.dueDate || article.publishDate || '')}
          </span>
        </div>

        {isClaimed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {assigneeUser ? (
                <Avatar src={assigneeUser.avatar} alt={assigneeUser.name} size="sm" />
              ) : (
                <Avatar emoji="👤" size="sm" />
              )}
              <span className="text-xs text-ink-600">{article.assignee}</span>
            </div>
            <Badge className={cn(getPriorityColor(article.priority), 'bg-opacity-100')}>
              {getStatusText(article.status)}
            </Badge>
          </div>
        ) : (
          <button
            onClick={() => handleClaim(article.id)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            认领
          </button>
        )}
      </Card>
    );
  };

  return (
    <div className="flex gap-6 animate-fade-in">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-900">栏目规划</h1>
            <p className="text-sm text-ink-500 mt-1">规划和管理内容排期</p>
          </div>
          <button className="btn-primary">
            <Calendar className="w-4 h-4" />
            新建排期
          </button>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-ink-800">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-ink-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-ink-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-ink-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-ink-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-ink-400 py-2"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  'min-h-24 p-1.5 rounded-lg border transition-colors',
                  day
                    ? 'bg-white border-ink-100 hover:border-copper-200'
                    : 'bg-transparent border-transparent'
                )}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-center mb-1">
                      <span
                        className={cn(
                          'w-6 h-6 flex items-center justify-center text-sm rounded-full font-medium',
                          isToday(day) && 'ring-2 ring-copper-500 text-copper-700 bg-copper-50'
                        )}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {getArticlesForDate(day).slice(0, 2).map((article) => (
                        <ArticleMiniCard key={article.id} article={article} />
                      ))}
                      {getArticlesForDate(day).length > 2 && (
                        <div className="text-xs text-ink-400 text-center">
                          +{getArticlesForDate(day).length - 2}更多
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="w-80 flex-shrink-0 space-y-4">
        <Card className="p-5">
          <h3 className="font-serif text-lg font-semibold text-ink-800 mb-4">选题池</h3>

          <div className="flex gap-1 p-1 bg-ink-50 rounded-lg mb-4">
            {[
              { key: 'all', label: '全部' },
              { key: 'unclaimed', label: '待认领' },
              { key: 'claimed', label: '已认领' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
                  activeTab === tab.key
                    ? 'bg-white text-ink-800 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {sortedArticles.map((article) => (
              <ArticlePoolCard key={article.id} article={article} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCcw,
  Send,
  Shield,
  MessageSquare,
  ListChecks,
  AlertOctagon,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  User,
  Check,
  X,
  UserCircle,
  SendHorizonal,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, getStatusText } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

type ReviewTab = 'brand' | 'comments' | 'publish' | 'retry';

interface BrandIssue {
  id: string;
  paragraph: number;
  word: string;
  suggestion: string;
  level: 'high' | 'medium' | 'low';
  replaced?: boolean;
}

const articleContent = [
  '随着科技的飞速发展，每年都有大量新产品涌入市场。面对琳琅满目的选择，消费者常常感到无所适从。本文将从多个维度出发，为大家筛选出真正值得入手的科技产品，帮助你做出明智的购买决策。',
  '在选购科技产品时，我们不仅要看重参数和性能，更要关注产品的实际使用体验。一款好的产品，应该能够真正融入我们的生活，解决实际问题，而不是成为摆设。据悉某品牌最新旗舰机采用了革命性的技术方案。',
  '根据最新的市场调研数据显示，本公司产品在用户满意度方面遥遥领先，绝对是行业第一。这种绝对化的表述需要引起我们的注意，避免违反广告法相关规定。',
  '接下来，我们将分品类详细介绍今年最值得关注的产品，包括智能手机、笔记本电脑、智能穿戴设备等。特别推荐这款被誉为最好用的蓝牙耳机，音质表现堪称完美。',
  '最后需要提醒大家的是，购买电子产品请务必选择正规渠道，避免买到假冒伪劣产品。我们保证所有推荐产品都是经过严格测试的正品行货，假一赔十。',
];

const brandIssues: BrandIssue[] = [
  { id: 'bi-1', paragraph: 1, word: '某品牌', suggestion: '相关品牌', level: 'low' },
  { id: 'bi-2', paragraph: 2, word: '本公司', suggestion: '我们', level: 'medium' },
  { id: 'bi-3', paragraph: 2, word: '绝对', suggestion: '相对', level: 'high' },
  { id: 'bi-4', paragraph: 2, word: '行业第一', suggestion: '行业前列', level: 'high' },
  { id: 'bi-5', paragraph: 3, word: '最好用', suggestion: '优秀的', level: 'high' },
  { id: 'bi-6', paragraph: 3, word: '完美', suggestion: '出色', level: 'high' },
  { id: 'bi-7', paragraph: 4, word: '假一赔十', suggestion: '品质保证', level: 'medium' },
];

const levelConfig = {
  high: { label: '高风险', color: 'danger', icon: AlertOctagon },
  medium: { label: '中风险', color: 'warning', icon: AlertTriangle },
  low: { label: '低风险', color: 'brand', icon: Shield },
};

function getParagraphsFromContent(content: string): string[] {
  if (!content) return articleContent;
  const paragraphs = content.split(/[。！？\n]/).filter(p => p.trim().length > 0);
  return paragraphs.length > 0 ? paragraphs : articleContent;
}

export default function Review() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('brand');
  const [issues, setIssues] = useState<BrandIssue[]>(brandIssues);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art-11');
  const [newComment, setNewComment] = useState('');
  const [selectedPublishIds, setSelectedPublishIds] = useState<Set<string>>(new Set());
  const [articleParagraphs, setArticleParagraphs] = useState<string[]>(articleContent);
  const prevArticleIdRef = useRef<string>(selectedArticleId);

  const {
    reviewComments,
    publishRecords,
    articles,
    accounts,
    users,
    tasks,
    toggleResolveComment,
    addReviewComment,
    retryPublish,
    updateArticleContent,
    updateTaskStatus,
  } = useAppStore();

  const articleComments = useMemo(
    () => reviewComments.filter((c) => c.articleId === selectedArticleId),
    [reviewComments, selectedArticleId]
  );

  const currentArticle = useMemo(() => articles.find((a) => a.id === selectedArticleId), [articles, selectedArticleId]);

  useEffect(() => {
    if (selectedArticleId !== prevArticleIdRef.current) {
      prevArticleIdRef.current = selectedArticleId;
      const article = articles.find((a) => a.id === selectedArticleId);
      if (article?.content) {
        setArticleParagraphs(getParagraphsFromContent(article.content));
      } else {
        setArticleParagraphs(articleContent);
      }
      setIssues(brandIssues.map((i) => ({ ...i, replaced: false })));
    }
  }, [selectedArticleId, articles]);

  const failedRecords = useMemo(() => publishRecords.filter((r) => r.status === 'failed'), [publishRecords]);
  const pendingArticles = useMemo(() => articles.filter((a) => ['review', 'scheduled', 'writing'].includes(a.status)), [articles]);

  const today = new Date().toISOString().split('T')[0];
  const todayFailed = useMemo(
    () => failedRecords.filter((r) => r.scheduledAt.startsWith(today)).length,
    [failedRecords, today]
  );
  const retriedSuccess = useMemo(
    () => publishRecords.filter((r) => r.status === 'success' && r.retryCount > 0).length,
    [publishRecords]
  );

  const handleReplace = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    setArticleParagraphs((prev) => {
      const newParagraphs = [...prev];
      const paraIndex = issue.paragraph - 1;
      if (newParagraphs[paraIndex]) {
        newParagraphs[paraIndex] = newParagraphs[paraIndex].replace(
          new RegExp(issue.word, 'g'),
          issue.suggestion
        );
      }
      updateArticleContent(selectedArticleId, newParagraphs.join('。'));
      return newParagraphs;
    });

    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, replaced: true } : i)));
  };

  const handleToggleResolve = (commentId: string) => {
    toggleResolveComment(commentId);
  };

  const handleBatchPublish = () => {
    selectedPublishIds.forEach((articleId) => {
      const task = tasks.find((t) => t.articleId === articleId);
      if (task) {
        updateTaskStatus(task.id, 'scheduled');
      }
    });
    setSelectedPublishIds(new Set());
  };

  const handleRetryAll = () => {
    failedRecords.forEach((record) => {
      retryPublish(record.id);
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addReviewComment({
      articleId: selectedArticleId,
      content: newComment,
      author: '张明',
      authorAvatar: '👨‍💼',
      type: 'general',
      resolved: false,
    });
    setNewComment('');
  };

  const handleTogglePublishSelect = (id: string) => {
    setSelectedPublishIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAllPublish = () => {
    if (selectedPublishIds.size === pendingArticles.length) {
      setSelectedPublishIds(new Set());
    } else {
      setSelectedPublishIds(new Set(pendingArticles.map((a) => a.id)));
    }
  };

  const getAccountName = (accountId: string) => accounts.find((a) => a.id === accountId)?.name || '-';
  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  const commentTypeLabel = {
    general: { label: '整体', color: 'brand' as const },
    inline: { label: '行内', color: 'copper' as const },
    brand: { label: '品牌', color: 'danger' as const },
  };

  return (
    <div className="h-full flex flex-col p-5 bg-ink-50 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'brand' as ReviewTab, label: '品牌校验', icon: Shield },
          { key: 'comments' as ReviewTab, label: '审稿意见', icon: MessageSquare },
          { key: 'publish' as ReviewTab, label: '发布清单', icon: ListChecks },
          { key: 'retry' as ReviewTab, label: '重试记录', icon: RefreshCcw },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-brand-700 text-white shadow-lg shadow-brand-700/20'
                : 'bg-white text-ink-600 hover:bg-brand-50 hover:text-brand-700 border border-ink-100'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'brand' && (
          <div className="h-full flex gap-4 overflow-hidden animate-fade-in">
            <div className="flex-1 card overflow-hidden flex flex-col min-w-0" style={{ flexBasis: '58%' }}>
              <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-ink-800">{currentArticle?.title || '文章预览'}</h3>
                  <Badge variant={issues.every((i) => i.replaced) ? 'success' : 'warning'}>
                    {issues.filter((i) => !i.replaced).length} 个待处理问题
                  </Badge>
                </div>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-ink-200 rounded-lg text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                >
                  {articles
                    .filter((a) => ['review', 'writing', 'scheduled'].includes(a.status))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {articleParagraphs.map((para, idx) => {
                  const paraIssues = issues.filter((i) => i.paragraph === idx + 1 && !i.replaced);
                  let highlightedPara = para;
                  paraIssues.forEach((issue) => {
                    highlightedPara = highlightedPara.replace(
                      new RegExp(issue.word, 'g'),
                      `<mark class="bg-red-200 text-red-800 px-0.5 rounded font-medium">${issue.word}</mark>`
                    );
                  });
                  return (
                    <div key={idx} className="group">
                      <div className="flex gap-4">
                        <span className="text-xs font-mono text-ink-400 mt-1.5 w-10 flex-shrink-0">第{idx + 1}段</span>
                        <p
                          className="flex-1 font-serif text-base leading-7 text-ink-700"
                          style={{ fontFamily: "'Noto Serif SC', 'Source Han Serif CN', Georgia, serif" }}
                          dangerouslySetInnerHTML={{ __html: highlightedPara }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col" style={{ flexBasis: '42%' }}>
              <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                <h3 className="font-semibold text-ink-800 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-copper-500" />
                  问题列表
                </h3>
                <span className="text-xs text-ink-500">{issues.length} 条</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {issues.map((issue) => {
                  const config = levelConfig[issue.level];
                  const Icon = config.icon;
                  return (
                    <div
                      key={issue.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        issue.replaced ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-ink-100 hover:border-ink-200'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg flex-shrink-0',
                            issue.level === 'high' && 'bg-red-50',
                            issue.level === 'medium' && 'bg-amber-50',
                            issue.level === 'low' && 'bg-brand-50'
                          )}
                        >
                          <Icon
                            size={16}
                            className={cn(
                              issue.level === 'high' && 'text-red-600',
                              issue.level === 'medium' && 'text-amber-600',
                              issue.level === 'low' && 'text-brand-600'
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs text-ink-500">第{issue.paragraph}段</span>
                            <Badge variant={config.color as 'danger' | 'warning' | 'brand'}>{config.label}</Badge>
                            {issue.replaced && (
                              <Badge variant="success">
                                <Check size={12} />
                                已替换
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">{issue.word}</span>
                            <span className="text-ink-400">→</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">{issue.suggestion}</span>
                          </div>
                          {!issue.replaced && (
                            <button
                              onClick={() => handleReplace(issue.id)}
                              className="mt-3 px-3 py-1.5 text-xs font-medium bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
                            >
                              一键替换
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="h-full flex gap-4 overflow-hidden animate-fade-in">
            <div className="flex-1 card overflow-hidden flex flex-col min-w-0" style={{ flexBasis: '58%' }}>
              <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                <h3 className="font-semibold text-ink-800">{currentArticle?.title || '文章预览'}</h3>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-ink-200 rounded-lg text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                >
                  {articles
                    .filter((a) => ['review', 'writing', 'scheduled'].includes(a.status))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {articleParagraphs.map((para, idx) => (
                  <div key={idx}>
                    <div className="flex gap-4">
                      <span className="text-xs font-mono text-ink-400 mt-1.5 w-10 flex-shrink-0">第{idx + 1}段</span>
                      <p
                        className="flex-1 font-serif text-base leading-7 text-ink-700"
                        style={{ fontFamily: "'Noto Serif SC', 'Source Han Serif CN', Georgia, serif" }}
                      >
                        {para}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden flex flex-col" style={{ flexBasis: '42%' }}>
              <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                <h3 className="font-semibold text-ink-800 flex items-center gap-2">
                  <MessageSquare size={16} className="text-brand-600" />
                  审稿意见
                </h3>
                <span className="text-xs text-ink-500">
                  {articleComments.filter((c) => !c.resolved).length} 条未解决
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {articleComments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-ink-400">
                    <MessageSquare size={40} strokeWidth={1.5} />
                    <p className="mt-2 text-sm">暂无审稿意见</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-1 bottom-1 w-px bg-ink-200" />
                    <div className="space-y-4">
                      {articleComments.map((comment) => {
                        const typeConfig = commentTypeLabel[comment.type];
                        return (
                          <div key={comment.id} className="relative pl-10">
                            <div
                              className={cn(
                                'absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center text-base border-2 border-white',
                                comment.resolved ? 'bg-emerald-100' : 'bg-brand-100'
                              )}
                            >
                              {comment.authorAvatar}
                            </div>
                            <div
                              className={cn(
                                'p-3 rounded-xl border',
                                comment.resolved ? 'bg-ink-50/50 border-ink-100' : 'bg-white border-ink-100'
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-sm font-medium text-ink-800">{comment.author}</span>
                                <Badge variant={typeConfig.color}>{typeConfig.label}</Badge>
                                {comment.lineNumber && (
                                  <span className="text-xs text-ink-400">第{comment.lineNumber}行</span>
                                )}
                                <div className="flex-1" />
                                <span className="text-xs text-ink-400 flex items-center gap-1">
                                  <Clock size={12} />
                                  {comment.createdAt}
                                </span>
                              </div>
                              <p className={cn('text-sm leading-6', comment.resolved ? 'text-ink-400' : 'text-ink-700')}>
                                {comment.content}
                              </p>
                              <div className="mt-2.5 flex items-center justify-end">
                                <button
                                  onClick={() => handleToggleResolve(comment.id)}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors',
                                    comment.resolved
                                      ? 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  )}
                                >
                                  {comment.resolved ? (
                                    <>
                                      <X size={12} />
                                      取消解决
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={12} />
                                      标记已解决
                                    </>
                                  )}
                                </button>
                              </div>
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-3 pl-3 border-l-2 border-ink-100 space-y-3">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-ink-700">{reply.author}</span>
                                        <span className="text-xs text-ink-400">{reply.createdAt}</span>
                                      </div>
                                      <p className="text-xs text-ink-600 leading-5">{reply.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-ink-100 bg-ink-50/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="input-base flex-1"
                    placeholder="添加审稿意见..."
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn-primary disabled:opacity-50"
                  >
                    <SendHorizonal size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="h-full card overflow-hidden flex flex-col animate-fade-in">
            <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-ink-800 flex items-center gap-2">
                  <ListChecks size={16} className="text-brand-600" />
                  发布清单
                </h3>
                <Badge variant="brand">{pendingArticles.length} 篇待发布</Badge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAllPublish}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    selectedPublishIds.size === pendingArticles.length && pendingArticles.length > 0
                      ? 'bg-brand-700 text-white'
                      : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
                  )}
                >
                  {selectedPublishIds.size === pendingArticles.length && pendingArticles.length > 0 ? (
                    <Check size={14} />
                  ) : null}
                  全选
                </button>
                <button className="btn-secondary">
                  <Calendar size={16} />
                  设置定时
                </button>
                <button
                  className="btn-primary"
                  disabled={selectedPublishIds.size === 0}
                  onClick={handleBatchPublish}
                >
                  <Send size={16} />
                  批量发布 ({selectedPublishIds.size})
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-ink-50/50 sticky top-0">
                  <tr className="border-b border-ink-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-12">
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">标题</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-32">账号</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-28">负责人</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-40">计划发布时间</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider w-24">状态</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider w-36">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {pendingArticles.map((article) => {
                    const assigneeUser = getUserById(article.assignee || '');
                    const isSelected = selectedPublishIds.has(article.id);
                    return (
                      <tr
                        key={article.id}
                        className={cn(
                          'transition-colors',
                          isSelected ? 'bg-brand-50/50' : 'hover:bg-ink-50/50'
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleTogglePublishSelect(article.id)}
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                              isSelected
                                ? 'bg-brand-700 border-brand-700'
                                : 'border-ink-300 hover:border-brand-500'
                            )}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-ink-800 text-sm">{article.title}</div>
                          <div className="text-xs text-ink-500 mt-0.5">{article.category}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-ink-700">{getAccountName(article.accountId)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {assigneeUser?.avatar ? (
                              <img src={assigneeUser.avatar} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <UserCircle size={22} className="text-ink-400" />
                            )}
                            <span className="text-sm text-ink-700">{assigneeUser?.name || article.assignee || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {article.publishDate ? (
                            <span className="text-sm text-ink-700 flex items-center gap-1.5">
                              <Calendar size={14} className="text-ink-400" />
                              {article.publishDate}
                            </span>
                          ) : (
                            <span className="text-sm text-ink-400">未设置</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              article.status === 'scheduled'
                                ? 'brand'
                                : article.status === 'review'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {getStatusText(article.status)}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-md text-ink-500 hover:text-brand-700 hover:bg-brand-50 transition-colors" title="预览">
                              <Eye size={16} />
                            </button>
                            <button className="p-1.5 rounded-md text-ink-500 hover:text-copper-600 hover:bg-copper-50 transition-colors" title="编辑">
                              <Pencil size={16} />
                            </button>
                            <button className="p-1.5 rounded-md text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="移除">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'retry' && (
          <div className="h-full flex flex-col gap-4 overflow-hidden animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-50">
                    <AlertOctagon size={22} className="text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-ink-500">总失败数</div>
                    <div className="text-2xl font-semibold text-ink-800 mt-0.5">{failedRecords.length}</div>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-50">
                    <Clock size={22} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-ink-500">今日失败</div>
                    <div className="text-2xl font-semibold text-ink-800 mt-0.5">{todayFailed}</div>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50">
                    <CheckCircle size={22} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-ink-500">已重试成功</div>
                    <div className="text-2xl font-semibold text-ink-800 mt-0.5">{retriedSuccess}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 card overflow-hidden flex flex-col min-h-0">
              <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                <h3 className="font-semibold text-ink-800 flex items-center gap-2">
                  <RefreshCcw size={16} className="text-copper-500" />
                  失败发布列表
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-500">{failedRecords.length} 条记录</span>
                  {failedRecords.length > 0 && (
                    <button
                      onClick={handleRetryAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-copper-600 text-white rounded-lg hover:bg-copper-700 transition-colors"
                    >
                      <RefreshCcw size={14} />
                      全部重试
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {failedRecords.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-ink-400">
                    <CheckCircle size={40} strokeWidth={1.5} className="text-emerald-400" />
                    <p className="mt-2 text-sm">暂无失败记录，太棒了！</p>
                  </div>
                ) : (
                  failedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl bg-white border border-ink-100 hover:border-ink-200 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-red-50 flex-shrink-0">
                          <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-ink-800 truncate">{record.articleTitle}</h4>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {getAccountName(record.accountId)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {record.scheduledAt}
                                </span>
                                <span className="flex items-center gap-1">
                                  <RefreshCcw size={12} />
                                  已重试 {record.retryCount} 次
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => retryPublish(record.id)}
                              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
                            >
                              <RefreshCcw size={14} />
                              重试
                            </button>
                          </div>
                          {record.errorMessage && (
                            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
                              <div className="text-xs font-medium text-red-700 mb-1">错误原因</div>
                              <p className="text-sm text-red-600">{record.errorMessage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

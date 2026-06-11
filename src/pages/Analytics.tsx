import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from 'recharts';
import {
  Eye, TrendingUp, Share2, Target, Flame, Repeat, Trophy, ExternalLink, ArrowRight, Filter, BookmarkPlus,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatNumber, formatPercent, formatDate } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

type TimeRange = '7d' | '30d' | '90d';
type RankTab = 'views' | 'shares' | 'conversions';

const timeRangeOptions: { value: TimeRange; label: string; days: number }[] = [
  { value: '7d', label: '近7天', days: 7 },
  { value: '30d', label: '近30天', days: 30 },
  { value: '90d', label: '近90天', days: 90 },
];

const BRAND_COLORS = {
  primary: '#1F5140',
  secondary: '#2E624F',
  copper: '#C68B59',
  copperLight: '#D9A972',
  brandLight: '#5E9880',
  brandLighter: '#8BC4AA',
};

const GROUP_COLORS = ['#1F5140', '#C68B59', '#4A6FA5', '#8B5A2B'];

export default function Analytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rankTab, setRankTab] = useState<RankTab>('views');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const { articles, accounts, groups, addMaterial } = useAppStore();

  const publishedArticles = useMemo(
    () => articles.filter((a) => a.status === 'published' || a.status === 'archived'),
    [articles]
  );

  const categories = useMemo(() => {
    const cats = Array.from(new Set(publishedArticles.map((a) => a.category)));
    return cats.sort();
  }, [publishedArticles]);

  const filteredArticles = useMemo(() => {
    const days = timeRangeOptions.find((o) => o.value === timeRange)?.days ?? 30;
    const today = new Date('2026-06-12');
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = formatDate(cutoff);

    return publishedArticles.filter((a) => {
      if (selectedGroup !== 'all') {
        const accountIds = accounts.filter((acc) => acc.groupId === selectedGroup).map((acc) => acc.id);
        if (!accountIds.includes(a.accountId)) return false;
      }
      if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
      if (a.publishDate && a.publishDate < cutoffStr) return false;
      return true;
    });
  }, [publishedArticles, selectedGroup, selectedCategory, timeRange, accounts]);

  const kpiData = useMemo(() => {
    const totalViews = filteredArticles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = filteredArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
    const totalShares = filteredArticles.reduce((sum, a) => sum + (a.shares || 0), 0);
    const totalConversions = filteredArticles.reduce((sum, a) => sum + (a.conversions || 0), 0);

    const avgOpenRate = totalViews > 0 ? (totalLikes / totalViews) * 10 : 0;
    const shareRate = totalViews > 0 ? (totalShares / totalViews) * 100 : 0;
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    return { totalViews, avgOpenRate, shareRate, conversionRate, totalConversions };
  }, [filteredArticles]);

  const rankData = useMemo(() => {
    const getSortKey = (a: typeof filteredArticles[0]) => {
      switch (rankTab) {
        case 'views': return a.views || 0;
        case 'shares': return a.shares || 0;
        case 'conversions': return a.conversions || 0;
      }
    };
    const sorted = [...filteredArticles].sort((a, b) => getSortKey(b) - getSortKey(a));
    return sorted.slice(0, 10);
  }, [filteredArticles, rankTab]);

  const barChartData = useMemo(() => {
    return [...filteredArticles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 6)
      .map((article) => ({
        name: article.title.length > 6 ? article.title.substring(0, 6) + '...' : article.title,
        阅读量: article.views || 0,
        转化数: article.conversions || 0,
      }));
  }, [filteredArticles]);

  const radarChartData = useMemo(() => {
    const dimensions = ['阅读量', '互动率', '分享率', '转化率', '涨粉数'];
    const groupAccountsMap = new Map<string, string[]>();
    accounts.forEach((acc) => {
      const gIds = groupAccountsMap.get(acc.groupId) || [];
      gIds.push(acc.id);
      groupAccountsMap.set(acc.groupId, gIds);
    });

    return dimensions.map((dim) => {
      const item: Record<string, string | number> = { dimension: dim };
      groups.forEach((group, idx) => {
        const gAccountIds = groupAccountsMap.get(group.id) || [];
        const gArticles = filteredArticles.filter((a) => gAccountIds.includes(a.accountId));
        const gViews = gArticles.reduce((s, a) => s + (a.views || 0), 0);
        const gLikes = gArticles.reduce((s, a) => s + (a.likes || 0), 0);
        const gShares = gArticles.reduce((s, a) => s + (a.shares || 0), 0);
        const gConversions = gArticles.reduce((s, a) => s + (a.conversions || 0), 0);
        const gAccounts = accounts.filter((acc) => acc.groupId === group.id);

        let value = 0;
        switch (dim) {
          case '阅读量':
            value = Math.min(100, (gViews / 100000) * 100);
            break;
          case '互动率':
            value = Math.min(100, gViews > 0 ? (gLikes / gViews) * 500 : 0);
            break;
          case '分享率':
            value = Math.min(100, gViews > 0 ? (gShares / gViews) * 800 : 0);
            break;
          case '转化率':
            value = Math.min(100, gViews > 0 ? (gConversions / gViews) * 1500 : 0);
            break;
          case '涨粉数': {
            const totalTrend = gAccounts.reduce((s, acc) => s + (acc.trend[acc.trend.length - 1] || 0), 0);
            value = Math.min(100, (totalTrend / (60000 * gAccounts.length || 60000)) * 100);
            break;
          }
        }
        item[group.name] = Math.round(value);
      });
      return item;
    });
  }, [groups, accounts, filteredArticles]);

  const areaChartData = useMemo(() => {
    const days = timeRangeOptions.find((o) => o.value === timeRange)?.days ?? 30;
    const today = new Date('2026-06-12');
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const dayArticles = filteredArticles.filter(
        (a) => a.publishDate && a.publishDate === dateStr
      );
      const dayViews = dayArticles.reduce((s, a) => s + (a.views || 0), 0);
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        发文数: dayArticles.length,
        阅读量: Math.round(dayViews / 1000),
      });
    }
    return data;
  }, [filteredArticles, timeRange]);

  const topArticles = useMemo(() => {
    return [...filteredArticles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8);
  }, [filteredArticles]);

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  );

  const getRankValue = (article: typeof filteredArticles[0]) => {
    switch (rankTab) {
      case 'views': return article.views || 0;
      case 'shares': return article.shares || 0;
      case 'conversions': return article.conversions || 0;
    }
  };

  const rankLabel: Record<RankTab, string> = {
    views: '阅读',
    shares: '分享',
    conversions: '转化',
  };

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2000);
  }, []);

  const handleDepositToMaterial = useCallback(
    (article: typeof filteredArticles[0]) => {
      const quotes = article.goldenQuotes || [];
      if (quotes.length === 0) {
        showToast('该文章暂无金句可沉淀');
        return;
      }
      quotes.forEach((quote) => {
        addMaterial({
          type: 'quote',
          title: quote,
          content: quote,
          tags: [],
          source: article.title,
          author: getAccountById(article.accountId)?.name,
        });
      });
      showToast(`已沉淀 ${quotes.length} 条金句到素材库`);
    },
    [addMaterial, getAccountById, showToast]
  );

  const maxRankValue = rankData.length > 0 ? getRankValue(rankData[0]) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">效果分析</h1>
          <p className="text-sm text-ink-500 mt-1">洞察内容表现，优化创作策略</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-ink-500" />
          <span className="text-sm font-medium text-ink-700">交叉筛选</span>
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-500 font-medium">账号分组</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGroup('all')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border',
                  selectedGroup === 'all'
                    ? 'bg-copper-600 text-white border-copper-600 shadow-sm'
                    : 'bg-copper-50 text-copper-700 border-copper-200 hover:bg-copper-100'
                )}
              >
                全部
              </button>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border',
                    selectedGroup === group.id
                      ? 'bg-copper-600 text-white border-copper-600 shadow-sm'
                      : 'bg-copper-50 text-copper-700 border-copper-200 hover:bg-copper-100'
                  )}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-500 font-medium">内容类型</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border',
                  selectedCategory === 'all'
                    ? 'bg-brand-700 text-white border-brand-700 shadow-sm'
                    : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                )}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border',
                    selectedCategory === cat
                      ? 'bg-brand-700 text-white border-brand-700 shadow-sm'
                      : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-ink-500 font-medium">时间范围</span>
            <div className="flex gap-2">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border',
                    timeRange === option.value
                      ? 'bg-ink-800 text-white border-ink-800 shadow-sm'
                      : 'bg-ink-50 text-ink-600 border-ink-200 hover:bg-ink-100'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总阅读量"
          value={formatNumber(kpiData.totalViews)}
          change={12.8}
          changeLabel="较上一周期"
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="平均在看率"
          value={formatPercent(kpiData.avgOpenRate / 100)}
          change={3.2}
          changeLabel="较上一周期"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="分享率"
          value={formatPercent(kpiData.shareRate / 100)}
          change={-1.5}
          changeLabel="较上一周期"
          icon={<Share2 className="w-5 h-5" />}
          highlight="copper"
        />
        <StatCard
          title="转化率"
          value={formatPercent(kpiData.conversionRate / 100)}
          change={8.6}
          changeLabel="较上一周期"
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-copper-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-copper-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">内容排行</h3>
              <p className="text-xs text-ink-500 mt-0.5">TOP 10 文章表现排名</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-ink-50 rounded-lg p-1">
            {([
              { key: 'views' as RankTab, label: '按阅读量' },
              { key: 'shares' as RankTab, label: '按分享数' },
              { key: 'conversions' as RankTab, label: '按转化数' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRankTab(tab.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                  rankTab === tab.key
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {rankData.map((article, idx) => {
            const value = getRankValue(article);
            const account = getAccountById(article.accountId);
            const barWidth = maxRankValue > 0 ? (value / maxRankValue) * 100 : 0;
            return (
              <div
                key={article.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  idx < 3 ? 'bg-copper-50/60' : 'hover:bg-ink-50'
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    idx === 0
                      ? 'bg-copper-500 text-white'
                      : idx === 1
                        ? 'bg-copper-400 text-white'
                        : idx === 2
                          ? 'bg-copper-300 text-white'
                          : 'bg-ink-100 text-ink-500'
                  )}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-800 truncate">{article.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-ink-400">{account?.name || '未知账号'}</span>
                    <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          idx < 3 ? 'bg-copper-500' : 'bg-brand-400'
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className={cn(
                    'text-sm font-bold',
                    idx < 3 ? 'text-copper-600' : 'text-ink-700'
                  )}>
                    {formatNumber(value)}
                  </div>
                  <div className="text-xs text-ink-400">{rankLabel[rankTab]}</div>
                </div>
              </div>
            );
          })}
          {rankData.length === 0 && (
            <div className="py-8 text-center text-sm text-ink-400">暂无数据</div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">阅读转化对比</h3>
              <p className="text-xs text-ink-500 mt-0.5">TOP6 文章阅读量与转化数对比分析</p>
            </div>
            <Badge variant="brand">TOP6 文章</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#5C6670', fontSize: 12 }}
                  axisLine={{ stroke: '#CFC9BE' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5C6670', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E4DC',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => formatNumber(value)}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="阅读量"
                  fill={BRAND_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="转化数"
                  fill={BRAND_COLORS.copper}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">分组对比</h3>
              <p className="text-xs text-ink-500 mt-0.5">按分组多维度表现雷达图</p>
            </div>
            <Badge variant="copper">分组维度</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#E8E4DC" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#5C6670', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#A8A092', fontSize: 10 }}
                  axisLine={false}
                />
                {groups.map((group, idx) => (
                  <Radar
                    key={group.id}
                    name={group.name}
                    dataKey={group.name}
                    stroke={GROUP_COLORS[idx % GROUP_COLORS.length]}
                    fill={GROUP_COLORS[idx % GROUP_COLORS.length]}
                    fillOpacity={0.15 + idx * 0.05}
                    strokeWidth={2}
                  />
                ))}
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink-800">发文趋势</h3>
            <p className="text-xs text-ink-500 mt-0.5">
              近{timeRangeOptions.find((o) => o.value === timeRange)?.days || 30}天发文数量与阅读效果趋势
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-600"></span>
              <span className="text-xs text-ink-500">发文数</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-copper-500"></span>
              <span className="text-xs text-ink-500">阅读量(k)</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaChartData}>
              <defs>
                <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={BRAND_COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND_COLORS.copper} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={BRAND_COLORS.copper} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#5C6670', fontSize: 11 }}
                axisLine={{ stroke: '#CFC9BE' }}
                tickLine={false}
                interval={timeRange === '90d' ? 6 : timeRange === '30d' ? 3 : 1}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#5C6670', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#5C6670', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E8E4DC',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="发文数"
                stroke={BRAND_COLORS.primary}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPosts)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="阅读量"
                stroke={BRAND_COLORS.copper}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-copper-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-copper-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">内容资产沉淀 - 爆款库</h3>
              <p className="text-xs text-ink-500 mt-0.5">高表现内容可直接复用创作</p>
            </div>
          </div>
          <Badge variant="copper">
            <Flame className="w-3 h-3" />
            共 {topArticles.length} 篇爆款
          </Badge>
        </div>

        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {topArticles.map((article, idx) => {
              const account = getAccountById(article.accountId);
              return (
                <div
                  key={article.id}
                  className={cn(
                    'w-72 shrink-0 rounded-xl p-5 transition-all duration-200',
                    'bg-gradient-to-br from-white to-copper-50/40',
                    'border-2 border-copper-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="copper">
                      <Flame className="w-3 h-3" />
                      TOP {idx + 1}
                    </Badge>
                    <Avatar
                      emoji={account?.avatar ? undefined : '📰'}
                      src={account?.avatar}
                      size="sm"
                    />
                  </div>

                  <h4 className="font-serif text-base font-semibold text-ink-900 line-clamp-2 leading-snug mb-2">
                    {article.title}
                  </h4>

                  <div className="flex items-center gap-2 mb-3 text-xs text-ink-500">
                    <span>{account?.name || '未知账号'}</span>
                    <span className="w-1 h-1 rounded-full bg-ink-300"></span>
                    <span>{article.publishDate}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-white/70">
                      <div className="text-sm font-bold text-brand-700">
                        {formatNumber(article.views || 0)}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">阅读</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/70">
                      <div className="text-sm font-bold text-brand-600">
                        {formatNumber(article.likes || 0)}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">在看</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/70">
                      <div className="text-sm font-bold text-copper-600">
                        {formatNumber(article.conversions || 0)}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">转化</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/draft', { state: { articleId: article.id } })}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-copper-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-copper-700 active:bg-copper-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      查看文章
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all duration-200"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        复用内容
                      </button>
                      <button
                        onClick={() => handleDepositToMaterial(article)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-copper-700 bg-copper-50 hover:bg-copper-100 rounded-lg transition-all duration-200"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        沉淀到素材
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-ink-800 text-white text-sm rounded-lg shadow-lg animate-slide-up z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from 'recharts';
import {
  BarChart3, Eye, TrendingUp, Share2, Target, Flame, Repeat, Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatNumber, formatPercent, formatDate } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

type TimeRange = '7d' | '30d' | '90d' | 'custom';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
  { value: 'custom', label: '自定义' },
];

const BRAND_COLORS = {
  primary: '#1F5140',
  secondary: '#2E624F',
  copper: '#C68B59',
  copperLight: '#D9A972',
  brandLight: '#5E9880',
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { articles, accounts } = useAppStore();

  const publishedArticles = useMemo(
    () => articles.filter((a) => a.status === 'published' || a.status === 'archived'),
    [articles]
  );

  const kpiData = useMemo(() => {
    const totalViews = publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = publishedArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
    const totalShares = publishedArticles.reduce((sum, a) => sum + (a.shares || 0), 0);
    const totalConversions = publishedArticles.reduce((sum, a) => sum + (a.conversions || 0), 0);

    const avgOpenRate = totalViews > 0 ? (totalLikes / totalViews) * 10 : 0;
    const shareRate = totalViews > 0 ? (totalShares / totalViews) * 100 : 0;
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    return {
      totalViews,
      avgOpenRate,
      shareRate,
      conversionRate,
      totalConversions,
    };
  }, [publishedArticles]);

  const barChartData = useMemo(() => {
    return publishedArticles
      .slice(0, 6)
      .map((article) => ({
        name: article.title.length > 8 ? article.title.substring(0, 8) + '...' : article.title,
        阅读量: article.views || 0,
        转化数: article.conversions || 0,
      }));
  }, [publishedArticles]);

  const radarChartData = useMemo(() => {
    const topAccounts = accounts.slice(0, 3);
    const dimensions = ['阅读量', '互动率', '分享率', '转化率', '涨粉数'];

    return dimensions.map((dim) => {
      const item: Record<string, string | number> = { dimension: dim };
      topAccounts.forEach((acc, idx) => {
        const accountArticles = publishedArticles.filter((a) => a.accountId === acc.id);
        const accViews = accountArticles.reduce((s, a) => s + (a.views || 0), 0);
        const accLikes = accountArticles.reduce((s, a) => s + (a.likes || 0), 0);
        const accShares = accountArticles.reduce((s, a) => s + (a.shares || 0), 0);
        const accConversions = accountArticles.reduce((s, a) => s + (a.conversions || 0), 0);

        let value = 0;
        switch (dim) {
          case '阅读量':
            value = Math.min(100, (accViews / 100000) * 100);
            break;
          case '互动率':
            value = Math.min(100, accViews > 0 ? (accLikes / accViews) * 500 : 0);
            break;
          case '分享率':
            value = Math.min(100, accViews > 0 ? (accShares / accViews) * 800 : 0);
            break;
          case '转化率':
            value = Math.min(100, accViews > 0 ? (accConversions / accViews) * 1500 : 0);
            break;
          case '涨粉数':
            value = Math.min(100, (acc.trend[acc.trend.length - 1] / 60000) * 100);
            break;
        }
        item[`账号${idx + 1}`] = Math.round(value);
      });
      return item;
    });
  }, [accounts, publishedArticles]);

  const areaChartData = useMemo(() => {
    const data = [];
    const today = new Date('2026-06-11');
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const dayArticles = publishedArticles.filter(
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
  }, [publishedArticles]);

  const topArticles = useMemo(() => {
    return [...publishedArticles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8);
  }, [publishedArticles]);

  const getAccountById = (id: string) => accounts.find((a) => a.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">效果分析</h1>
          <p className="text-sm text-ink-500 mt-1">洞察内容表现，优化创作策略</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-ink-200 p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5',
                timeRange === option.value
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-ink-50'
              )}
            >
              {option.value === 'custom' && <Calendar className="w-3.5 h-3.5" />}
              {option.label}
            </button>
          ))}
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-800">阅读转化对比</h3>
              <p className="text-xs text-ink-500 mt-0.5">各文章阅读量与转化数对比分析</p>
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
              <h3 className="font-serif text-lg font-semibold text-ink-800">账号对比</h3>
              <p className="text-xs text-ink-500 mt-0.5">多维度账号表现雷达图</p>
            </div>
            <Badge variant="copper">核心账号</Badge>
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
                <Radar
                  name={accounts[0]?.name || '账号1'}
                  dataKey="账号1"
                  stroke={BRAND_COLORS.primary}
                  fill={BRAND_COLORS.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name={accounts[1]?.name || '账号2'}
                  dataKey="账号2"
                  stroke={BRAND_COLORS.copper}
                  fill={BRAND_COLORS.copper}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name={accounts[2]?.name || '账号3'}
                  dataKey="账号3"
                  stroke={BRAND_COLORS.brandLight}
                  fill={BRAND_COLORS.brandLight}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
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
            <p className="text-xs text-ink-500 mt-0.5">近30天发文数量与阅读效果趋势</p>
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
                interval={3}
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

                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-copper-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-copper-700 active:bg-copper-800">
                    <Repeat className="w-4 h-4" />
                    复用内容
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

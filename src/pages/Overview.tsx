import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, Eye, TrendingUp, Target } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import Avatar from '@/components/ui/Avatar';
import { formatNumber, formatPercent, cn } from '@/lib/utils';
import type { Account } from '@/types';

const getStatusBadgeVariant = (status: Account['status']) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'warning':
      return 'warning';
    case 'inactive':
      return 'default';
  }
};

const getStatusText = (status: Account['status']) => {
  switch (status) {
    case 'active':
      return '运行中';
    case 'warning':
      return '需关注';
    case 'inactive':
      return '已停用';
  }
};

export default function Overview() {
  const { accounts, groups, selectedGroupId, articles, setSelectedGroup } = useAppStore();

  const filteredAccounts = useMemo(() => {
    return selectedGroupId ? accounts.filter((a) => a.groupId === selectedGroupId) : accounts;
  }, [accounts, selectedGroupId]);

  const filteredAccountIds = useMemo(() => {
    return filteredAccounts.map((a) => a.id);
  }, [filteredAccounts]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => filteredAccountIds.includes(a.accountId));
  }, [articles, filteredAccountIds]);

  const kpi = useMemo(() => {
    const totalFollowers = filteredAccounts.reduce((sum, acc) => sum + acc.followers, 0);
    const weeklyViews = filteredAccounts.reduce((sum, acc) => sum + acc.trend.reduce((s, t) => s + t, 0), 0);

    const publishedArticles = filteredArticles.filter((a) => a.status === 'published');
    const totalLikes = publishedArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
    const totalViews = publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0);
    const avgOpenRate = totalViews > 0 ? totalLikes / totalViews : 0;
    const conversions = publishedArticles.reduce((sum, a) => sum + (a.conversions || 0), 0);

    return {
      totalFollowers,
      weeklyViews,
      avgOpenRate,
      conversions,
      followersChange: Math.round((Math.random() * 10 - 2) * 10) / 10,
      viewsChange: Math.round((Math.random() * 15 - 3) * 10) / 10,
      openRateChange: Math.round((Math.random() * 3 - 1) * 10) / 10,
      conversionsChange: Math.round((Math.random() * 12 - 2) * 10) / 10,
    };
  }, [filteredAccounts, filteredArticles]);

  const chartData = useMemo(() => {
    const now = new Date('2026-06-12');
    const data: { date: string; views: number; posts: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const fullDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const dayArticles = filteredArticles.filter(
        (a) => a.publishDate === fullDateStr && a.status === 'published'
      );
      const views = dayArticles.reduce((sum, a) => sum + (a.views || 0), 0);
      const posts = dayArticles.length;

      data.push({ date: dateStr, views, posts });
    }

    return data;
  }, [filteredArticles]);

  const pieData = useMemo(() => {
    return filteredAccounts.map((acc) => ({
      name: acc.name,
      value: acc.followers,
      color: groups.find((g) => g.id === acc.groupId)?.color || '#C68B59',
    }));
  }, [filteredAccounts, groups]);

  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.map((value, i) => {
          const height = max > 0 ? (value / max) * 100 : 20;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-copper-300 to-copper-500"
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  const AccountCard = ({ account }: { account: Account }) => {
    const group = groups.find((g) => g.id === account.groupId);

    return (
      <Card variant="hover" className="p-5 animate-stagger">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={account.avatar} alt={account.name} size="lg" />
            <div>
              <h3 className="font-semibold text-ink-800">{account.name}</h3>
              <Badge variant={getStatusBadgeVariant(account.status)}>
                {getStatusText(account.status)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-ink-400">粉丝数</p>
            <p className="text-lg font-bold text-copper-700 font-serif">
              {formatNumber(account.followers)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400">本周发文</p>
            <p className="text-lg font-bold text-ink-800 font-serif">
              {account.weeklyPosts}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-ink-400 mb-1">7日趋势</p>
          <Sparkline data={account.trend} />
        </div>

        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${group?.color}15`, color: group?.color }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: group?.color }}
          />
          {group?.name}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">账号总览</h1>
        <p className="text-sm text-ink-500 mt-1">查看所有账号的整体表现数据</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGroup(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selectedGroupId === null
              ? 'bg-copper-500 text-white shadow-md'
              : 'bg-white text-ink-600 hover:bg-ink-100 border border-ink-200'
          )}
        >
          全部
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              selectedGroupId === group.id
                ? 'bg-copper-500 text-white shadow-md'
                : 'bg-white text-ink-600 hover:bg-ink-100 border border-ink-200'
            )}
          >
            {group.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总粉丝数"
          value={formatNumber(kpi.totalFollowers)}
          change={kpi.followersChange}
          changeLabel="较上月"
          icon={<Users className="w-5 h-5" />}
          highlight="copper"
        />
        <StatCard
          title="7日阅读量"
          value={formatNumber(kpi.weeklyViews)}
          change={kpi.viewsChange}
          changeLabel="较上周"
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="平均打开率"
          value={formatPercent(kpi.avgOpenRate)}
          change={kpi.openRateChange}
          changeLabel="较上周"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="转化数"
          value={formatNumber(kpi.conversions)}
          change={kpi.conversionsChange}
          changeLabel="较上月"
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-serif text-lg font-semibold text-ink-800 mb-4">近30天发文趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
                <XAxis dataKey="date" tick={{ fill: '#5C6670', fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#5C6670', fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#5C6670', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E4DC',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'views' ? formatNumber(value) : value,
                    name === 'views' ? '阅读量' : '发文数',
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  name="阅读量"
                  stroke="#C68B59"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#C68B59' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="posts"
                  name="发文数"
                  stroke="#1F5140"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6, fill: '#1F5140' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-lg font-semibold text-ink-800 mb-4">账号粉丝占比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatNumber(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E4DC',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {pieData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-ink-500">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-ink-800 mb-4">账号列表</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {filteredAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}

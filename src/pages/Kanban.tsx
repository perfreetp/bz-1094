import Card from '@/components/ui/Card';

export default function Kanban() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">任务看板</h1>
        <p className="text-sm text-ink-500 mt-1">查看和管理所有内容任务</p>
      </div>
      <Card className="p-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="font-serif text-xl font-semibold text-ink-800 mb-2">任务看板</h3>
          <p className="text-sm text-ink-500">页面建设中...</p>
        </div>
      </Card>
    </div>
  );
}

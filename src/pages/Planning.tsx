import Card from '@/components/ui/Card';

export default function Planning() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">栏目规划</h1>
        <p className="text-sm text-ink-500 mt-1">规划和管理内容栏目</p>
      </div>
      <Card className="p-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-3xl">📅</span>
          </div>
          <h3 className="font-serif text-xl font-semibold text-ink-800 mb-2">栏目规划</h3>
          <p className="text-sm text-ink-500">页面建设中...</p>
        </div>
      </Card>
    </div>
  );
}

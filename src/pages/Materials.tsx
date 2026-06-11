import { useState, useMemo } from 'react';
import {
  Search,
  UploadCloud,
  Tag,
  Image,
  FileText,
  Quote,
  BookmarkPlus,
  Eye,
  X,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn, formatNumber } from '@/lib/utils';
import type { Material, MaterialType } from '@/types';

const tabs: Array<{ key: MaterialType | 'all'; label: string; icon: typeof Image }> = [
  { key: 'all', label: '全部', icon: Image },
  { key: 'image', label: '图片', icon: Image },
  { key: 'copy', label: '文案', icon: FileText },
  { key: 'quote', label: '金句', icon: Quote },
  { key: 'competitor', label: '竞品文章', icon: BookmarkPlus },
];

export default function Materials() {
  const {
    materials,
    tags,
    selectedMaterialType,
    setSelectedMaterialType,
    toggleMaterialTag,
    currentUser,
  } = useAppStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState<string | null>(null);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (selectedMaterialType !== 'all' && material.type !== selectedMaterialType) {
        return false;
      }
      if (searchKeyword && !material.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }
      if (selectedTags.length > 0 && !selectedTags.some((tagId) => material.tags.includes(tagId))) {
        return false;
      }
      return true;
    });
  }, [materials, selectedMaterialType, searchKeyword, selectedTags]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleMaterialTagToggle = (materialId: string, tagId: string) => {
    toggleMaterialTag(materialId, tagId);
  };

  const closePopover = () => {
    setTagPopoverOpen(null);
  };

  const renderMaterialCard = (material: Material, index: number) => {
    const isTagPopoverOpen = tagPopoverOpen === material.id;

    return (
      <div
        key={material.id}
        className="relative animate-stagger"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {material.type === 'image' && (
          <Card variant="hover" className="overflow-hidden h-full">
            <div className="relative aspect-square bg-gradient-to-br from-brand-100 to-copper-100 flex items-center justify-center">
              <span className="text-6xl">{material.thumbnail || '🖼️'}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="font-medium text-white text-sm line-clamp-2">{material.title}</h4>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-ink-500">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatNumber(material.views || 0)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagPopoverOpen(isTagPopoverOpen ? null : material.id);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-200',
                    material.tags.length > 0
                      ? 'bg-copper-100 text-copper-600'
                      : 'text-ink-400 hover:bg-ink-100'
                  )}
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        )}

        {material.type === 'copy' && (
          <Card variant="hover" className="h-full flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-ink-100 rounded-lg">
                  <FileText className="w-4 h-4 text-ink-600" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagPopoverOpen(isTagPopoverOpen ? null : material.id);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-200',
                    material.tags.length > 0
                      ? 'bg-copper-100 text-copper-600'
                      : 'text-ink-400 hover:bg-ink-100'
                  )}
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-medium text-ink-800 mb-2">{material.title}</h4>
              <p className="text-sm text-ink-500 line-clamp-2">{material.content}</p>
            </div>
            <div className="px-4 py-3 border-t border-ink-100">
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <Eye className="w-3.5 h-3.5" />
                <span>{formatNumber(material.views || 0)}</span>
              </div>
            </div>
          </Card>
        )}

        {material.type === 'quote' && (
          <Card
            variant="hover"
            className="h-full bg-gradient-to-br from-copper-500 to-copper-600 border-copper-500 text-white overflow-hidden"
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Quote className="w-10 h-10 text-white/30" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagPopoverOpen(isTagPopoverOpen ? null : material.id);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-200',
                    material.tags.length > 0
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:bg-white/10'
                  )}
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
              <p className="font-serif text-lg font-medium text-white mb-4 flex-1">
                "{material.content}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">—— {material.title}</span>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatNumber(material.views || 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {material.type === 'competitor' && (
          <Card variant="hover" className="h-full flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <BookmarkPlus className="w-4 h-4 text-brand-600" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagPopoverOpen(isTagPopoverOpen ? null : material.id);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-200',
                    material.tags.length > 0
                      ? 'bg-copper-100 text-copper-600'
                      : 'text-ink-400 hover:bg-ink-100'
                  )}
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-medium text-ink-800 mb-2 line-clamp-2">{material.title}</h4>
              <p className="text-sm text-ink-500 line-clamp-2 mb-3">{material.content}</p>
              <div className="flex items-center gap-2">
                <Badge variant="brand">{material.source}</Badge>
                <Badge variant="default">
                  <Eye className="w-3 h-3" />
                  {formatNumber(material.views || 0)}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {isTagPopoverOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={closePopover}
            />
            <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-white rounded-xl shadow-lg border border-ink-100 p-2 animate-fade-in">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <span className="text-sm font-medium text-ink-700">选择标签</span>
                <button
                  onClick={closePopover}
                  className="p-1 rounded hover:bg-ink-100 text-ink-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {tags.map((tag) => {
                  const isSelected = material.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleMaterialTagToggle(material.id, tag.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors',
                        isSelected
                          ? 'bg-copper-50 text-copper-700'
                          : 'hover:bg-ink-50 text-ink-700'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" onClick={() => setTagPopoverOpen(null)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">素材中心</h1>
          <p className="text-sm text-ink-500 mt-1">管理和整理创作素材</p>
        </div>
        <button className="btn-primary">
          <UploadCloud className="w-4 h-4" />
          上传素材
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-ink-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedMaterialType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedMaterialType(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200',
                isActive
                  ? 'text-copper-600 border-copper-500'
                  : 'text-ink-500 border-transparent hover:text-ink-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-start flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="搜索素材..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-base pl-9"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2" onClick={(e) => e.stopPropagation()}>
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  isSelected
                    ? 'bg-copper-500 text-white'
                    : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
                <span
                  className={cn(
                    'text-xs',
                    isSelected ? 'text-white/80' : 'text-ink-400'
                  )}
                >
                  {tag.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.map((material, index) =>
          renderMaterialCard(material, index)
        )}
      </div>

      {filteredMaterials.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-ink-400" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink-800 mb-2">暂无素材</h3>
            <p className="text-sm text-ink-500">没有找到符合条件的素材，试试调整筛选条件</p>
          </div>
        </Card>
      )}
    </div>
  );
}

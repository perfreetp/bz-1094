import { useState, useMemo, useCallback } from 'react';
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
  CheckSquare,
  Square,
  Tags,
  Trash2,
  ListChecks,
  Package,
  FolderPlus,
  Layers,
  ArrowLeft,
  User,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { cn, formatNumber } from '@/lib/utils';
import type { Material, MaterialType } from '@/types';

const tabs: Array<{ key: MaterialType | 'all'; label: string; icon: typeof Image }> = [
  { key: 'all', label: '全部', icon: Image },
  { key: 'image', label: '图片', icon: Image },
  { key: 'copy', label: '文案', icon: FileText },
  { key: 'quote', label: '金句', icon: Quote },
  { key: 'competitor', label: '竞品文章', icon: BookmarkPlus },
];

const contentCategories = [
  '产品评测',
  '行业洞察',
  '护肤教程',
  '生活方式',
  '美食教程',
  '健身',
];

type BatchDialogMode = 'add' | 'remove' | null;

export default function Materials() {
  const {
    materials,
    tags,
    accounts,
    users,
    materialPackages,
    selectedMaterialType,
    setSelectedMaterialType,
    toggleMaterialTag,
    currentUser,
    createMaterialPackage,
    addMaterialsToPackage,
    deleteMaterialPackage,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'library' | 'packages'>('library');
  const [savePackageOpen, setSavePackageOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    accountId: '',
    category: '',
    description: '',
  });
  const [selectedPackageFilter, setSelectedPackageFilter] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [batchDialogMode, setBatchDialogMode] = useState<BatchDialogMode>(null);

  const usersById = useMemo(() => {
    const map: Record<string, (typeof users)[number]> = {};
    for (const u of users) map[u.id] = u;
    return map;
  }, [users]);

  const accountsById = useMemo(() => {
    const map: Record<string, (typeof accounts)[number]> = {};
    for (const a of accounts) map[a.id] = a;
    return map;
  }, [accounts]);

  const selectedPackageData = useMemo(() => {
    if (!selectedPackageFilter) return null;
    return materialPackages.find((p) => p.id === selectedPackageFilter) || null;
  }, [selectedPackageFilter, materialPackages]);

  const packageMaterialIds = useMemo(() => {
    if (!selectedPackageData) return [] as string[];
    return selectedPackageData.materialIds;
  }, [selectedPackageData]);

  const tagCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const tag of tags) {
      map.set(tag.id, materials.filter((m) => m.tags.includes(tag.id)).length);
    }
    return map;
  }, [materials, tags]);

  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (selectedPackageFilter) {
      result = result.filter((m) => packageMaterialIds.includes(m.id));
    }
    return result.filter((material) => {
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
  }, [materials, selectedMaterialType, searchKeyword, selectedTags, selectedPackageFilter, packageMaterialIds]);

  const selectedMaterials = useMemo(
    () => materials.filter((m) => selectedMaterialIds.has(m.id)),
    [materials, selectedMaterialIds]
  );

  const batchAvailableTags = useMemo(() => {
    if (batchDialogMode !== 'remove') return tags;
    const existingTagIds = new Set<string>();
    for (const m of selectedMaterials) {
      for (const tagId of m.tags) {
        existingTagIds.add(tagId);
      }
    }
    return tags.filter((t) => existingTagIds.has(t.id));
  }, [batchDialogMode, selectedMaterials, tags]);

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

  const enterBatchMode = useCallback(() => {
    setBatchMode(true);
    setSelectedMaterialIds(new Set());
  }, []);

  const exitBatchMode = useCallback(() => {
    setBatchMode(false);
    setSelectedMaterialIds(new Set());
  }, []);

  const toggleMaterialSelection = useCallback((materialId: string) => {
    setSelectedMaterialIds((prev) => {
      const next = new Set(prev);
      if (next.has(materialId)) {
        next.delete(materialId);
      } else {
        next.add(materialId);
      }
      return next;
    });
  }, []);

  const handleBatchTagAction = useCallback(
    (tagId: string) => {
      const isAdd = batchDialogMode === 'add';
      for (const material of selectedMaterials) {
        const hasTag = material.tags.includes(tagId);
        if (isAdd && !hasTag) {
          toggleMaterialTag(material.id, tagId);
        } else if (!isAdd && hasTag) {
          toggleMaterialTag(material.id, tagId);
        }
      }
      setBatchDialogMode(null);
    },
    [batchDialogMode, selectedMaterials, toggleMaterialTag]
  );

  const openSavePackageDialog = () => {
    setPackageForm({ name: '', accountId: '', category: '', description: '' });
    setSavePackageOpen(true);
  };

  const handleSavePackage = () => {
    if (!packageForm.name.trim()) return;
    const newPkgId = `pkg-${Date.now()}`;
    createMaterialPackage({
      name: packageForm.name.trim(),
      materialIds: Array.from(selectedMaterialIds),
      accountId: packageForm.accountId || undefined,
      category: packageForm.category || undefined,
      description: packageForm.description.trim() || undefined,
      createdBy: currentUser.id,
    });
    setSavePackageOpen(false);
    exitBatchMode();
  };

  const handleViewPackageMaterials = (packageId: string) => {
    setSelectedPackageFilter(packageId);
    setSelectedMaterialType('all');
    setViewMode('library');
  };

  const handleDeletePackage = (packageId: string) => {
    deleteMaterialPackage(packageId);
    if (selectedPackageFilter === packageId) {
      setSelectedPackageFilter(null);
    }
  };

  const renderCheckbox = (materialId: string) => {
    const isSelected = selectedMaterialIds.has(materialId);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMaterialSelection(materialId);
        }}
        className={cn(
          'absolute top-2 left-2 z-10 transition-all duration-200',
          isSelected ? 'text-copper-500 scale-110' : 'text-white/70 hover:text-white'
        )}
      >
        {isSelected ? (
          <CheckSquare className="w-5 h-5 drop-shadow-sm" />
        ) : (
          <Square className="w-5 h-5 drop-shadow-sm" />
        )}
      </button>
    );
  };

  const renderMaterialCard = (material: Material, index: number) => {
    const isTagPopoverOpen = tagPopoverOpen === material.id;
    const isSelected = selectedMaterialIds.has(material.id);

    const cardWrapper = (children: React.ReactNode) => (
      <div
        key={material.id}
        className="relative animate-stagger"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {batchMode && renderCheckbox(material.id)}
        <div
          onClick={() => {
            if (batchMode) toggleMaterialSelection(material.id);
          }}
          className={cn(
            batchMode && 'cursor-pointer',
            batchMode && isSelected && 'ring-2 ring-copper-400 rounded-xl'
          )}
        >
          {children}
        </div>
        {!batchMode && isTagPopoverOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={closePopover} />
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
                  const isActive = material.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleMaterialTagToggle(material.id, tag.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors',
                        isActive
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
                      {isActive && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );

    if (material.type === 'image') {
      return cardWrapper(
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
              {!batchMode && (
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
              )}
            </div>
          </div>
        </Card>
      );
    }

    if (material.type === 'copy') {
      return cardWrapper(
        <Card variant="hover" className="h-full flex flex-col">
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-ink-100 rounded-lg">
                <FileText className="w-4 h-4 text-ink-600" />
              </div>
              {!batchMode && (
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
              )}
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
      );
    }

    if (material.type === 'quote') {
      return cardWrapper(
        <Card
          variant="hover"
          className="h-full bg-gradient-to-br from-copper-500 to-copper-600 border-copper-500 text-white overflow-hidden"
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <Quote className="w-10 h-10 text-white/30" />
              {!batchMode && (
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
              )}
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
      );
    }

    if (material.type === 'competitor') {
      return cardWrapper(
        <Card variant="hover" className="h-full flex flex-col">
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                <BookmarkPlus className="w-4 h-4 text-brand-600" />
              </div>
              {!batchMode && (
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
              )}
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
      );
    }

    return null;
  };

  const renderPackageCard = (pkg: (typeof materialPackages)[number]) => {
    const creator = usersById[pkg.createdBy];
    const linkedAccount = pkg.accountId ? accountsById[pkg.accountId] : null;

    return (
      <div
        key={pkg.id}
        className="animate-fade-in rounded-xl border border-ink-200 bg-white overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
      >
        <div className="h-2 bg-gradient-to-r from-copper-400 via-copper-500 to-copper-600" />
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-copper-100 rounded-lg">
              <Layers className="w-5 h-5 text-copper-600" />
            </div>
          </div>
          <h3 className="font-serif text-lg font-bold text-ink-800 mb-1 line-clamp-1">
            {pkg.name}
          </h3>
          {pkg.description && (
            <p className="text-sm text-ink-500 line-clamp-2 mb-3">{pkg.description}</p>
          )}
          {!pkg.description && <div className="mb-3" />}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {linkedAccount && (
              <Badge variant="default">
                <User className="w-3 h-3" />
                {linkedAccount.name}
              </Badge>
            )}
            {pkg.category && <Badge variant="copper">{pkg.category}</Badge>}
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-500">
              <div className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                <span>{formatNumber(pkg.materialIds.length)} 个素材</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{pkg.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-ink-100">
              <div className="flex items-center gap-2">
                {creator ? (
                  <>
                    <Avatar emoji={creator.avatar ? undefined : '👤'} src={creator.avatar} size="sm" />
                    <span className="text-xs text-ink-600 font-medium">{creator.name}</span>
                  </>
                ) : (
                  <>
                    <Avatar emoji="👤" size="sm" />
                    <span className="text-xs text-ink-600 font-medium">未知用户</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleViewPackageMaterials(pkg.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-copper-700 bg-copper-50 hover:bg-copper-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看素材
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" onClick={() => setTagPopoverOpen(null)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">素材中心</h1>
          <p className="text-sm text-ink-500 mt-1">
            {viewMode === 'library' ? '管理和整理创作素材' : '管理素材合集，快速复用'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewMode === 'library' ? (
            batchMode ? (
              <button onClick={exitBatchMode} className="btn-ghost text-ink-600">
                <X className="w-4 h-4" />
                退出批量
              </button>
            ) : (
              <>
                <button onClick={enterBatchMode} className="btn-secondary">
                  <ListChecks className="w-4 h-4" />
                  批量整理
                </button>
                <button className="btn-primary">
                  <UploadCloud className="w-4 h-4" />
                  上传素材
                </button>
              </>
            )
          ) : (
            <button onClick={openSavePackageDialog} className="btn-primary">
              <FolderPlus className="w-4 h-4" />
              新建素材包
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center bg-ink-100 rounded-full p-1">
          <button
            onClick={() => setViewMode('library')}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
              viewMode === 'library'
                ? 'bg-gradient-to-r from-copper-500 to-copper-600 text-white shadow-sm'
                : 'text-ink-600 hover:text-ink-800'
            )}
          >
            <Layers className="w-4 h-4" />
            素材库
          </button>
          <button
            onClick={() => setViewMode('packages')}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
              viewMode === 'packages'
                ? 'bg-gradient-to-r from-copper-500 to-copper-600 text-white shadow-sm'
                : 'text-ink-600 hover:text-ink-800'
            )}
          >
            <Package className="w-4 h-4" />
            素材包
          </button>
        </div>
      </div>

      {viewMode === 'library' && (
        <>
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

          {selectedPackageData && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-copper-50 border border-copper-200">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-copper-600" />
                <span className="text-sm text-copper-700">
                  当前筛选：素材包「<span className="font-semibold">{selectedPackageData.name}</span>」
                </span>
              </div>
              <button
                onClick={() => setSelectedPackageFilter(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-copper-700 bg-white hover:bg-copper-100 border border-copper-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                取消筛选
              </button>
            </div>
          )}

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
                const count = tagCountMap.get(tag.id) ?? 0;
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
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', batchMode && 'pb-20')}>
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
        </>
      )}

      {viewMode === 'packages' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-ink-800">素材包</h2>
            <span className="text-sm text-ink-500">
              共 {formatNumber(materialPackages.length)} 个素材包
            </span>
          </div>

          {materialPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {materialPackages.map((pkg) => renderPackageCard(pkg))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-copper-100 flex items-center justify-center">
                  <Package className="w-8 h-8 text-copper-500" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-ink-800 mb-2">暂无素材包</h3>
                <p className="text-sm text-ink-500 mb-4">创建素材包，整理常用素材合集</p>
                <button onClick={openSavePackageDialog} className="btn-primary">
                  <FolderPlus className="w-4 h-4" />
                  新建素材包
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {batchMode && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-ink-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink-700">
                已选 <span className="text-copper-600 font-semibold">{selectedMaterialIds.size}</span> 项
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBatchDialogMode('add')}
                disabled={selectedMaterialIds.size === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tags className="w-4 h-4" />
                批量添加标签
              </button>
              <button
                onClick={() => setBatchDialogMode('remove')}
                disabled={selectedMaterialIds.size === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                批量移除标签
              </button>
              <button
                onClick={openSavePackageDialog}
                disabled={selectedMaterialIds.size === 0}
                className="btn-primary bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-600 hover:to-copper-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderPlus className="w-4 h-4" />
                保存为素材包
              </button>
              <button onClick={exitBatchMode} className="btn-ghost text-ink-600">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {batchDialogMode && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setBatchDialogMode(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-xl border border-ink-100 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-ink-100">
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink-800">
                  {batchDialogMode === 'add' ? '批量添加标签' : '批量移除标签'}
                </h3>
                <p className="text-sm text-ink-500 mt-0.5">
                  {batchDialogMode === 'add'
                    ? `将添加到 ${selectedMaterialIds.size} 个素材`
                    : `将从 ${selectedMaterialIds.size} 个素材移除`}
                </p>
              </div>
              <button
                onClick={() => setBatchDialogMode(null)}
                className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-80 overflow-y-auto">
              {batchAvailableTags.length === 0 ? (
                <div className="text-center py-8">
                  <Trash2 className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-ink-400">没有可操作的标签</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {batchAvailableTags.map((tag) => {
                    const affectedCount = selectedMaterials.filter((m) =>
                      batchDialogMode === 'add'
                        ? !m.tags.includes(tag.id)
                        : m.tags.includes(tag.id)
                    ).length;
                    if (affectedCount === 0) return null;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleBatchTagAction(tag.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-700 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium">{tag.name}</span>
                        </span>
                        <span className="text-xs text-ink-400">
                          {batchDialogMode === 'add' ? '添加' : '移除'} {affectedCount} 项
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {savePackageOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSavePackageOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-ink-100 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-copper-100 rounded-lg">
                  <FolderPlus className="w-5 h-5 text-copper-600" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-ink-800">保存为素材包</h3>
                  <p className="text-sm text-ink-500 mt-0.5">
                    已选 {selectedMaterialIds.size} 个素材
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSavePackageOpen(false)}
                className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  素材包名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入素材包名称"
                  value={packageForm.name}
                  onChange={(e) =>
                    setPackageForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    关联账号
                  </label>
                  <select
                    value={packageForm.accountId}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, accountId: e.target.value }))
                    }
                    className="input-base appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">不关联</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    内容类型
                  </label>
                  <select
                    value={packageForm.category}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="input-base appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">请选择</option>
                    {contentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  描述
                </label>
                <textarea
                  placeholder="添加描述信息（可选）"
                  value={packageForm.description}
                  onChange={(e) =>
                    setPackageForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="input-base resize-none"
                />
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink-50 border border-ink-200">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-ink-500" />
                  <span className="text-sm text-ink-600">素材数量</span>
                </div>
                <span className="text-sm font-semibold text-copper-600">
                  {selectedMaterialIds.size} 个素材
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t border-ink-100">
              <button
                onClick={() => setSavePackageOpen(false)}
                className="btn-ghost text-ink-600"
              >
                取消
              </button>
              <button
                onClick={handleSavePackage}
                disabled={!packageForm.name.trim() || selectedMaterialIds.size === 0}
                className="btn-primary bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-600 hover:to-copper-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                确认保存
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useCallback, useEffect, useMemo, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Quote,
  Smartphone,
  Bold,
  Italic,
  Heading2,
  List,
  Image,
  Link,
  Minus,
  Undo,
  Redo,
  Copy,
  Check,
  ImagePlus,
  X,
  Loader2,
  Pencil,
  Package,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  LayoutPanelLeft,
  FileText,
  BookmarkPlus,
  Search,
  Eye,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn, formatNumber } from '@/utils';
import type { Material, MaterialType } from '@/types';

type TemplateType = 'simple' | 'business' | 'lively';
type AiTabType = 'title' | 'opening' | 'quote' | 'preview';
type OpeningStyleType = 'story' | 'data' | 'suspense' | 'resonance';
type MaterialPanelTab = 'packages' | 'browse';
type BrowseMaterialType = MaterialType | 'all';

interface ContentItem {
  id: string;
  type: 'paragraph' | 'image-placeholder';
  content?: string;
  thumbnail?: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getParagraphsFromContent = (content: string): string[] => {
  return content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
};

const typeLabels: Record<MaterialType, string> = {
  image: '图',
  copy: '文案',
  quote: '金句',
  competitor: '竞品',
};

const browseTabs: Array<{ key: BrowseMaterialType; label: string; icon: typeof Image }> = [
  { key: 'all', label: '全部', icon: Image },
  { key: 'image', label: '图片', icon: Image },
  { key: 'copy', label: '文案', icon: FileText },
  { key: 'quote', label: '金句', icon: Quote },
  { key: 'competitor', label: '竞品', icon: BookmarkPlus },
];

export default function Draft() {
  const { materials, materialPackages, articles } = useAppStore();
  const location = useLocation();

  const [currentArticleId, setCurrentArticleId] = useState<string>('');
  const [articleAccountId, setArticleAccountId] = useState<string>('');
  const [articleCategory, setArticleCategory] = useState<string>('');
  const [articleTitle, setArticleTitle] = useState('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { id: generateId(), type: 'paragraph', content: '' },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('simple');
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const [activeMaterialPanel, setActiveMaterialPanel] = useState(false);
  const [materialPanelTab, setMaterialPanelTab] = useState<MaterialPanelTab>('packages');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [browseFilter, setBrowseFilter] = useState<BrowseMaterialType>('all');
  const [browseSearch, setBrowseSearch] = useState('');
  const [copiedMaterialId, setCopiedMaterialId] = useState<string | null>(null);

  const [activeAiTab, setActiveAiTab] = useState<AiTabType>('title');
  const [keywordInput, setKeywordInput] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedOpeningStyle, setSelectedOpeningStyle] = useState<OpeningStyleType>('story');
  const [generatedOpenings, setGeneratedOpenings] = useState<string[]>([]);
  const [extractedQuotes, setExtractedQuotes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2000);
  }, []);

  const copyToClipboard = useCallback(async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      }
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败');
    }
  }, [showToast]);

  const copyMaterial = useCallback(async (text: string, materialId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMaterialId(materialId);
      setTimeout(() => setCopiedMaterialId(null), 1500);
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败');
    }
  }, [showToast]);

  useEffect(() => {
    const locationState = location.state as { articleId?: string } | null;
    if (locationState?.articleId) {
      const article = articles.find((a) => a.id === locationState.articleId);
      if (article) {
        setCurrentArticleId(article.id);
        setArticleAccountId(article.accountId);
        setArticleCategory(article.category);
        setArticleTitle(article.title);
        const paragraphs = getParagraphsFromContent(article.content);
        if (paragraphs.length > 0) {
          setContentItems(
            paragraphs.map((p) => ({ id: generateId(), type: 'paragraph' as const, content: p }))
          );
        }
      }
    }
  }, [location.state, articles]);

  const articleContent = useMemo(
    () =>
      contentItems
        .filter((item) => item.type === 'paragraph')
        .map((item) => item.content || ''),
    [contentItems]
  );

  const matchedPackages = useMemo(() => {
    if (!articleAccountId || !articleCategory) return [];
    return materialPackages.filter(
      (p) => p.accountId === articleAccountId && p.category === articleCategory
    );
  }, [materialPackages, articleAccountId, articleCategory]);

  const otherPackages = useMemo(() => {
    if (!articleAccountId || !articleCategory) return materialPackages;
    return materialPackages.filter(
      (p) => !(p.accountId === articleAccountId && p.category === articleCategory)
    );
  }, [materialPackages, articleAccountId, articleCategory]);

  const getPackageMaterials = useCallback(
    (pkgId: string) => {
      const pkg = materialPackages.find((p) => p.id === pkgId);
      if (!pkg) return [];
      return materials.filter((m) => pkg.materialIds.includes(m.id));
    },
    [materialPackages, materials]
  );

  const getMaterialTypeDistribution = useCallback(
    (pkgId: string) => {
      const pkgMaterials = getPackageMaterials(pkgId);
      const count: Record<MaterialType, number> = { image: 0, copy: 0, quote: 0, competitor: 0 };
      pkgMaterials.forEach((m) => {
        count[m.type]++;
      });
      return count;
    },
    [getPackageMaterials]
  );

  const insertParagraphAtEnd = useCallback((text: string) => {
    setContentItems((prev) => [...prev, { id: generateId(), type: 'paragraph', content: text }]);
  }, []);

  const insertImagePlaceholder = useCallback((thumb?: string) => {
    setContentItems((prev) => [
      ...prev,
      { id: generateId(), type: 'image-placeholder', thumbnail: thumb },
    ]);
  }, []);

  const insertMaterial = useCallback(
    (material: Material) => {
      switch (material.type) {
        case 'image':
          insertImagePlaceholder(material.thumbnail);
          break;
        case 'copy':
        case 'competitor':
          insertParagraphAtEnd(material.content || material.title);
          break;
        case 'quote':
          insertParagraphAtEnd(material.content || material.title);
          break;
      }
      showToast('已插入');
    },
    [insertImagePlaceholder, insertParagraphAtEnd, showToast]
  );

  const generateTitles = async () => {
    if (!keywordInput.trim()) {
      showToast('请输入关键词');
      return;
    }
    setIsGenerating(true);
    setGeneratedTitles([]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const keywords = keywordInput.split(',').map((k) => k.trim()).filter(Boolean);
    const prefixes = [
      '深度解析', '独家揭秘', '万字长文', '实战指南', '从零开始',
      '一文读懂', '2026最新', '专家视角', '行业洞察', '方法论',
    ];
    const suffixes = [
      '完全指南', '最佳实践', '核心原理', '进阶之路', '实战手册',
      '思维模型', '底层逻辑', '系统方法', '高效技巧', '避坑指南',
    ];
    const titles = Array.from({ length: 10 }, () => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      return `${prefix}：${keyword}${suffix}`;
    });
    setGeneratedTitles(titles);
    setIsGenerating(false);
  };

  const generateOpenings = async () => {
    setIsGenerating(true);
    setGeneratedOpenings([]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const currentContent = articleContent[0] || '这是一篇关于成长与探索的文章';
    const styleOpenings: Record<OpeningStyleType, string[]> = {
      story: [
        `三年前的那个下午，${currentContent.slice(0, 20)}...正是这个看似偶然的决定，彻底改变了后续的一切。`,
        `我至今清晰地记得第一次接触这件事的场景。${currentContent.slice(0, 15)}...从那一刻起，我便深深沉浸其中。`,
        `朋友常常问我是如何起步的。故事要从${currentContent.slice(0, 10)}...说起，那是一段充满未知与惊喜的旅程。`,
      ],
      data: [
        `数据显示，${Math.floor(Math.random() * 50 + 30)}% 的人在这个领域遭遇过挫折。${currentContent.slice(0, 15)}...而我们的方法成功率高达 92%。`,
        `过去五年间，相关市场规模增长了 ${Math.floor(Math.random() * 300 + 100)}%。${currentContent.slice(0, 10)}...这背后隐藏着怎样的底层逻辑？`,
        `据行业报告，${Math.floor(Math.random() * 80 + 10)} 万从业者正在面临转型挑战。${currentContent.slice(0, 12)}...本文将用数据告诉你答案。`,
      ],
      suspense: [
        `你有没有想过，${currentContent.slice(0, 15)}...背后究竟隐藏着什么不为人知的规律？读完这篇文章，你会恍然大悟。`,
        `绝大多数人不知道的真相是：${currentContent.slice(0, 10)}...并不是我们想象的那样。接下来的内容将颠覆你的认知。`,
        `如果我告诉你，${currentContent.slice(0, 12)}...其实从一开始就错了，你会作何感想？让我们一起揭开谜底。`,
      ],
      resonance: [
        `我们都曾经历过这样的时刻：${currentContent.slice(0, 15)}...那种迷茫与无助，我深有体会。今天我想把我的经验分享给你。`,
        `相信你也曾有过类似的困惑：${currentContent.slice(0, 10)}...到底应该如何突破？这篇文章写给每一个正在努力的人。`,
        `成长路上，我们总会遇到各种挑战。${currentContent.slice(0, 12)}...我知道你正在经历什么，因为我也曾走过同样的路。`,
      ],
    };
    setGeneratedOpenings(styleOpenings[selectedOpeningStyle]);
    setIsGenerating(false);
  };

  const extractQuotes = async () => {
    setIsGenerating(true);
    setExtractedQuotes([]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const quotes = [
      '真正的成长，来自于一次次突破舒适区的勇气。',
      '方法比努力更重要，方向比速度更关键。',
      '每一个看似轻松的背后，都有不为人知的坚持。',
      '深度思考的能力，是这个时代最稀缺的竞争力。',
      '种一棵树最好的时间是十年前，其次是现在。',
    ];
    setExtractedQuotes(quotes);
    setIsGenerating(false);
  };

  const selectTitle = (title: string) => {
    setArticleTitle(title);
    showToast('已选用标题');
  };

  const insertOpening = (opening: string) => {
    setContentItems((prev) => {
      const newItems = [...prev];
      const firstParagraphIndex = newItems.findIndex((item) => item.type === 'paragraph');
      if (firstParagraphIndex >= 0) {
        newItems[firstParagraphIndex] = { ...newItems[firstParagraphIndex], content: opening };
      }
      return newItems;
    });
    showToast('已插入开头');
  };

  const insertQuote = (quote: string) => {
    setContentItems((prev) => [
      ...prev,
      { id: generateId(), type: 'paragraph', content: quote },
    ]);
    showToast('已插入金句');
  };

  const updateParagraph = (id: string, content: string) => {
    setContentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item))
    );
  };

  const insertImagePlaceholderEditor = () => {
    const insertIndex = editingParagraphId
      ? contentItems.findIndex((item) => item.id === editingParagraphId) + 1
      : contentItems.length;
    setContentItems((prev) => [
      ...prev.slice(0, insertIndex),
      { id: generateId(), type: 'image-placeholder' },
      ...prev.slice(insertIndex),
    ]);
    showToast('已插入配图占位');
  };

  const removeImagePlaceholder = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addNewParagraph = () => {
    setContentItems((prev) => [...prev, { id: generateId(), type: 'paragraph', content: '' }]);
  };

  const filteredBrowseMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (browseFilter !== 'all' && material.type !== browseFilter) {
        return false;
      }
      if (browseSearch && !material.title.toLowerCase().includes(browseSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [materials, browseFilter, browseSearch]);

  const templateOptions = [
    { id: 'simple' as TemplateType, name: '简约', description: '白底黑字，清爽阅读' },
    { id: 'business' as TemplateType, name: '商务', description: '墨绿标题，专业稳重' },
    { id: 'lively' as TemplateType, name: '活泼', description: '铜色装饰，生动有趣' },
  ];

  const openingStyles = [
    { id: 'story' as OpeningStyleType, name: '故事型' },
    { id: 'data' as OpeningStyleType, name: '数据型' },
    { id: 'suspense' as OpeningStyleType, name: '悬念型' },
    { id: 'resonance' as OpeningStyleType, name: '共鸣型' },
  ];

  const aiTabs = [
    { id: 'title' as AiTabType, name: '标题生成', icon: Sparkles },
    { id: 'opening' as AiTabType, name: '开头改写', icon: Wand2 },
    { id: 'quote' as AiTabType, name: '金句提炼', icon: Quote },
    { id: 'preview' as AiTabType, name: '排版预览', icon: Smartphone },
  ];

  const getTitleStyle = (template: TemplateType) => {
    switch (template) {
      case 'business':
        return 'text-brand-700 border-b-2 border-brand-200 pb-3';
      case 'lively':
        return 'text-copper-700 relative pl-4 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-copper-500 before:rounded-full';
      default:
        return 'text-ink-800';
    }
  };

  const getParagraphStyle = (template: TemplateType) => {
    switch (template) {
      case 'business':
        return 'text-ink-700 leading-loose';
      case 'lively':
        return 'text-ink-600 leading-relaxed first-letter:text-2xl first-letter:font-semibold first-letter:text-copper-600';
      default:
        return 'text-ink-700 leading-loose';
    }
  };

  const ToolButton = ({ icon: Icon, onClick, label }: { icon: ComponentType<LucideProps>; onClick?: () => void; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 text-ink-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
      title={label}
    >
      <Icon size={18} />
    </button>
  );

  const ShimmerCard = () => (
    <div className="bg-ink-50 rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-ink-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-ink-200 rounded w-1/2"></div>
    </div>
  );

  const renderMaterialCard = (material: Material, key: string) => {
    const isCopied = copiedMaterialId === material.id;
    const textToCopy = material.content || material.title;

    if (material.type === 'image') {
      return (
        <div key={key} className="bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-video bg-gradient-to-br from-brand-50 to-copper-50 flex items-center justify-center text-4xl">
            {material.thumbnail || '🖼️'}
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-ink-700 line-clamp-1 mb-2">{material.title}</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => insertMaterial(material)}
                className="flex-1 px-2 py-1 text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
              >
                插入
              </button>
              <button
                type="button"
                onClick={() => copyMaterial(textToCopy, material.id)}
                className="px-2 py-1 text-xs text-ink-600 bg-ink-50 hover:bg-ink-100 rounded-md transition-colors"
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (material.type === 'quote') {
      return (
        <div key={key} className="bg-gradient-to-br from-copper-500 to-copper-600 rounded-xl text-white p-3 hover:shadow-md transition-shadow">
          <Quote size={20} className="text-white/30 mb-2" />
          <p className="text-xs font-medium text-white line-clamp-3 mb-2">"{material.content}"</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => insertMaterial(material)}
              className="flex-1 px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              插入
            </button>
            <button
              type="button"
              onClick={() => copyMaterial(textToCopy, material.id)}
              className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      );
    }

    if (material.type === 'copy' || material.type === 'competitor') {
      const iconEl = material.type === 'copy' ? <FileText size={14} /> : <BookmarkPlus size={14} />;
      const iconColor = material.type === 'copy' ? 'text-ink-500' : 'text-brand-600';
      const iconBg = material.type === 'copy' ? 'bg-ink-100' : 'bg-brand-100';
      return (
        <div key={key} className="bg-white rounded-xl border border-ink-100 p-3 hover:shadow-md transition-shadow flex flex-col">
          <div className={`w-7 h-7 rounded-md ${iconBg} flex items-center justify-center mb-2 ${iconColor}`}>
            {iconEl}
          </div>
          <p className="text-xs font-medium text-ink-700 line-clamp-1 mb-1">{material.title}</p>
          <p className="text-[11px] text-ink-500 line-clamp-2 flex-1 mb-2">{material.content}</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => insertMaterial(material)}
              className="flex-1 px-2 py-1 text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
            >
              插入
            </button>
            <button
              type="button"
              onClick={() => copyMaterial(textToCopy, material.id)}
              className="px-2 py-1 text-xs text-ink-600 bg-ink-50 hover:bg-ink-100 rounded-md transition-colors"
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPackageMaterialCard = (material: Material, key: string) => {
    const isCopied = copiedMaterialId === material.id;
    const textToCopy = material.content || material.title;

    if (material.type === 'image') {
      return (
        <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-ink-100 hover:border-ink-200 transition-colors">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-brand-50 to-copper-50 flex items-center justify-center text-2xl flex-shrink-0">
            {material.thumbnail || '🖼️'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 line-clamp-1">{material.title}</p>
            {material.views !== undefined && (
              <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
                <Eye size={10} /> {formatNumber(material.views)}
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => insertMaterial(material)}
              className="px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              插入
            </button>
            <button
              type="button"
              onClick={() => copyMaterial(textToCopy, material.id)}
              className="px-2.5 py-1.5 text-xs text-ink-500 bg-ink-50 hover:bg-ink-100 rounded-lg transition-colors"
              title="复制"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      );
    }

    if (material.type === 'quote') {
      return (
        <div key={key} className="relative p-4 bg-gradient-to-br from-copper-50 to-white rounded-xl border border-copper-100">
          <Quote size={20} className="absolute top-3 left-3 text-copper-300 opacity-50" />
          <p className="text-sm text-ink-700 leading-relaxed pl-6 pr-2 font-medium mb-3">
            "{material.content}"
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => insertMaterial(material)}
              className="px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              插入
            </button>
            <button
              type="button"
              onClick={() => copyMaterial(textToCopy, material.id)}
              className="px-2.5 py-1.5 text-xs text-ink-500 bg-ink-50 hover:bg-ink-100 rounded-lg transition-colors"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      );
    }

    if (material.type === 'copy' || material.type === 'competitor') {
      const iconEl = material.type === 'copy' ? <FileText size={14} /> : <BookmarkPlus size={14} />;
      const iconColor = material.type === 'copy' ? 'text-ink-500' : 'text-brand-600';
      const iconBg = material.type === 'copy' ? 'bg-ink-100' : 'bg-brand-100';
      return (
        <div key={key} className="p-3 bg-white rounded-xl border border-ink-100 hover:border-ink-200 transition-colors">
          <div className="flex items-start gap-2 mb-2">
            <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
              {iconEl}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-800 line-clamp-1">{material.title}</p>
              {material.source && material.type === 'competitor' && (
                <Badge variant="default" className="mt-0.5 text-[10px]">{material.source}</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-ink-600 line-clamp-2 mb-2">{material.content}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => insertMaterial(material)}
              className="px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              插入
            </button>
            <button
              type="button"
              onClick={() => copyMaterial(textToCopy, material.id)}
              className="px-2.5 py-1.5 text-xs text-ink-500 bg-ink-50 hover:bg-ink-100 rounded-lg transition-colors"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">智能草稿</h1>
        <p className="text-sm text-ink-500 mt-1">AI 辅助内容创作</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="flex">
          <div className="w-12 flex-shrink-0 flex flex-col items-center py-4 gap-2 border-r border-ink-100 bg-ink-50/50 rounded-l-xl">
            <button
              type="button"
              onClick={() => setActiveMaterialPanel(false)}
              className={cn(
                'w-10 h-12 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 gap-1',
                !activeMaterialPanel
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-ink-500 hover:bg-white hover:text-brand-600'
              )}
              title="编辑"
            >
              <Pencil size={16} />
              编辑
            </button>
            <button
              type="button"
              onClick={() => setActiveMaterialPanel(true)}
              className={cn(
                'w-10 h-12 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 gap-1',
                activeMaterialPanel
                  ? 'bg-copper-600 text-white shadow-md'
                  : 'text-ink-500 hover:bg-white hover:text-copper-600'
              )}
              title="素材"
            >
              <Package size={16} />
              素材
            </button>
          </div>

          <div
            className={cn(
              'transition-all duration-300 ease-in-out overflow-hidden',
              activeMaterialPanel ? 'w-80 opacity-100' : 'w-0 opacity-0'
            )}
          >
            <Card className="h-full flex flex-col rounded-l-none overflow-hidden">
              <div className="flex border-b border-ink-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMaterialPanelTab('packages');
                    setSelectedPackageId(null);
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all border-b-2',
                    materialPanelTab === 'packages'
                      ? 'text-copper-700 border-copper-500 bg-copper-50/30'
                      : 'text-ink-500 border-transparent hover:text-ink-700 hover:bg-ink-50'
                  )}
                >
                  <FolderKanban size={14} />
                  匹配素材包
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMaterialPanelTab('browse');
                    setSelectedPackageId(null);
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all border-b-2',
                    materialPanelTab === 'browse'
                      ? 'text-brand-700 border-brand-500 bg-brand-50/30'
                      : 'text-ink-500 border-transparent hover:text-ink-700 hover:bg-ink-50'
                  )}
                >
                  <LayoutPanelLeft size={14} />
                  全部浏览
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {materialPanelTab === 'packages' && !selectedPackageId && (
                  <div className="p-3 space-y-4">
                    {(articleAccountId && articleCategory) && matchedPackages.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <Badge variant="copper">推荐</Badge>
                          <span className="text-xs text-ink-500">
                            匹配当前账号·{articleCategory}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {matchedPackages.map((pkg) => {
                            const dist = getMaterialTypeDistribution(pkg.id);
                            return (
                              <div
                                key={pkg.id}
                                className="p-3 bg-gradient-to-br from-copper-50 to-white rounded-xl border-2 border-copper-200 hover:border-copper-400 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-semibold text-ink-800 text-sm">{pkg.name}</h5>
                                    <Badge variant="copper">推荐</Badge>
                                  </div>
                                </div>
                                {pkg.description && (
                                  <p className="text-xs text-ink-500 line-clamp-2 mb-2">
                                    {pkg.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-ink-400">
                                    <span className="text-ink-600 font-medium">{pkg.materialIds.length}</span> 个素材
                                    <span className="mx-1.5 text-ink-300">·</span>
                                    {(['image', 'copy', 'quote', 'competitor'] as MaterialType[]).map((t) => (
                                      dist[t] > 0 && (
                                        <span key={t} className="mr-1">
                                          {dist[t]}{typeLabels[t]}
                                        </span>
                                      )
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPackageId(pkg.id)}
                                    className="px-3 py-1 text-xs font-medium text-copper-700 bg-copper-100 hover:bg-copper-200 rounded-lg transition-colors"
                                  >
                                    打开
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(articleAccountId && articleCategory) && matchedPackages.length === 0 && (
                      <div className="p-4 bg-ink-50 rounded-xl text-center">
                        <Package size={28} className="mx-auto text-ink-300 mb-2" />
                        <p className="text-sm text-ink-500">暂无匹配素材包</p>
                        <p className="text-xs text-ink-400 mt-1">
                          账号·{articleCategory}
                        </p>
                      </div>
                    )}

                    {otherPackages.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <Badge variant="default">其他</Badge>
                          <span className="text-xs text-ink-500">更多素材包可选</span>
                        </div>
                        <div className="space-y-2">
                          {otherPackages.map((pkg) => {
                            const dist = getMaterialTypeDistribution(pkg.id);
                            return (
                              <div
                                key={pkg.id}
                                className="p-3 bg-white rounded-xl border border-ink-100 hover:border-ink-200 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <h5 className="font-semibold text-ink-800 text-sm">{pkg.name}</h5>
                                </div>
                                {pkg.description && (
                                  <p className="text-xs text-ink-500 line-clamp-2 mb-2">
                                    {pkg.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-ink-400">
                                    <span className="text-ink-600 font-medium">{pkg.materialIds.length}</span> 个素材
                                    <span className="mx-1.5 text-ink-300">·</span>
                                    {(['image', 'copy', 'quote', 'competitor'] as MaterialType[]).map((t) => (
                                      dist[t] > 0 && (
                                        <span key={t} className="mr-1">
                                          {dist[t]}{typeLabels[t]}
                                        </span>
                                      )
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPackageId(pkg.id)}
                                    className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                                  >
                                    打开
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {materialPanelTab === 'packages' && selectedPackageId && (() => {
                  const pkg = materialPackages.find((p) => p.id === selectedPackageId);
                  if (!pkg) return null;
                  const pkgMaterials = getPackageMaterials(pkg.id);
                  const groupedMaterials: Record<MaterialType, Material[]> = {
                    image: [],
                    copy: [],
                    quote: [],
                    competitor: [],
                  };
                  pkgMaterials.forEach((m) => {
                    groupedMaterials[m.type].push(m);
                  });
                  return (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-ink-100 bg-ink-50/50 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedPackageId(null)}
                          className="flex items-center gap-1 text-sm text-ink-600 hover:text-brand-600 transition-colors"
                        >
                          <ChevronLeft size={14} />
                          返回列表
                        </button>
                        <span className="text-xs text-ink-400">
                          {pkgMaterials.length} 个素材
                        </span>
                      </div>
                      <div className="p-3 space-y-4 flex-1 overflow-y-auto">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-ink-800 text-base">{pkg.name}</h4>
                          {pkg.accountId === articleAccountId && pkg.category === articleCategory && (
                            <Badge variant="copper">推荐</Badge>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-ink-500">{pkg.description}</p>
                        )}

                        {(['image', 'copy', 'quote', 'competitor'] as MaterialType[]).map((type) => (
                          groupedMaterials[type].length > 0 && (
                            <div key={type}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                  'w-5 h-5 rounded-md flex items-center justify-center text-white text-xs',
                                  type === 'image' && 'bg-brand-500',
                                  type === 'copy' && 'bg-ink-500',
                                  type === 'quote' && 'bg-copper-500',
                                  type === 'competitor' && 'bg-purple-500'
                                )}>
                                  {type === 'image' && <Image size={10} />}
                                  {type === 'copy' && <FileText size={10} />}
                                  {type === 'quote' && <Quote size={10} />}
                                  {type === 'competitor' && <BookmarkPlus size={10} />}
                                </div>
                                <span className="text-sm font-medium text-ink-700">
                                  {{ image: '图片素材', copy: '文案素材', quote: '金句素材', competitor: '竞品分析' }[type]}
                                </span>
                                <span className="text-xs text-ink-400">
                                  {groupedMaterials[type].length} 项
                                </span>
                              </div>
                              <div className="space-y-2 pl-7">
                                {groupedMaterials[type].map((m) =>
                                  renderPackageMaterialCard(m, m.id)
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {materialPanelTab === 'browse' && (
                  <div className="h-full flex flex-col">
                    <div className="p-3 space-y-2 border-b border-ink-100 flex-shrink-0">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                        <input
                          type="text"
                          placeholder="搜索素材..."
                          value={browseSearch}
                          onChange={(e) => setBrowseSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm bg-ink-50 border border-ink-200 rounded-lg outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-0.5">
                        {browseTabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => setBrowseFilter(tab.key)}
                              className={cn(
                                'flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all',
                                browseFilter === tab.key
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                              )}
                            >
                              <Icon size={12} />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                      {filteredBrowseMaterials.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {filteredBrowseMaterials.map((material) =>
                            renderMaterialCard(material, material.id)
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search size={32} className="text-ink-300 mb-3" />
                          <p className="text-sm text-ink-500">暂无素材</p>
                          <p className="text-xs text-ink-400 mt-1">调整筛选条件试试</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className={cn(
          'flex flex-col flex-1 transition-all duration-300',
          activeMaterialPanel ? 'min-w-0' : ''
        )}>
          <Card className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="输入文章标题..."
                className="w-full font-serif text-3xl font-semibold text-ink-800 bg-transparent border-none outline-none placeholder:text-ink-300"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              />

              <div className="flex items-center gap-1 py-2 border-y border-ink-100">
                <ToolButton icon={Bold} label="加粗" />
                <ToolButton icon={Italic} label="斜体" />
                <ToolButton icon={Quote} label="引用" />
                <ToolButton icon={Heading2} label="二级标题" />
                <ToolButton icon={List} label="列表" />
                <ToolButton icon={Image} label="图片" />
                <ToolButton icon={Link} label="链接" />
                <ToolButton icon={Minus} label="分割线" />
                <div className="w-px h-5 bg-ink-200 mx-1" />
                <ToolButton icon={Undo} label="撤销" />
                <ToolButton icon={Redo} label="重做" />
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={insertImagePlaceholderEditor}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-copper-600 bg-copper-50 hover:bg-copper-100 rounded-lg transition-colors"
                >
                  <ImagePlus size={16} />
                  插入配图占位
                </button>
              </div>

              <div className="space-y-4">
                {contentItems.map((item, index) => (
                  <div key={item.id} className="animate-slide-up">
                    {item.type === 'paragraph' ? (
                      <div
                        className="group relative"
                        onMouseEnter={() => setEditingParagraphId(item.id)}
                        onMouseLeave={() => setEditingParagraphId(null)}
                      >
                        {editingParagraphId === item.id && (
                          <button
                            type="button"
                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="编辑段落"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <textarea
                          value={item.content || ''}
                          onChange={(e) => updateParagraph(item.id, e.target.value)}
                          placeholder={index === 0 ? '开始写你的第一段...' : '继续书写...'}
                          className="w-full min-h-[80px] p-3 bg-ink-50 hover:bg-ink-100/50 focus:bg-white rounded-lg border border-transparent hover:border-ink-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none transition-all text-ink-700 leading-loose placeholder:text-ink-300"
                        />
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="aspect-video border-2 border-dashed border-ink-200 rounded-lg bg-ink-50 flex flex-col items-center justify-center text-ink-400 hover:border-copper-400 hover:bg-copper-50/30 transition-colors cursor-pointer overflow-hidden">
                          {item.thumbnail ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <div className="text-6xl mb-2">{item.thumbnail}</div>
                              <span className="text-sm text-ink-500">点击替换配图</span>
                            </div>
                          ) : (
                            <>
                              <ImagePlus size={32} className="mb-2" />
                              <span className="text-sm">点击替换配图</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImagePlaceholder(item.id)}
                          className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full text-ink-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addNewParagraph}
                  className="w-full py-3 border-2 border-dashed border-ink-200 rounded-lg text-ink-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/30 transition-all text-sm"
                >
                  + 添加段落
                </button>
              </div>

              <div className="pt-4 border-t border-ink-100">
                <h4 className="text-sm font-medium text-ink-600 mb-3">选择排版模板</h4>
                <div className="grid grid-cols-3 gap-3">
                  {templateOptions.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all duration-200',
                        selectedTemplate === template.id
                          ? 'border-copper-500 bg-copper-50/50'
                          : 'border-ink-100 hover:border-ink-200 bg-white'
                      )}
                    >
                      <div className={cn(
                        'font-serif font-semibold mb-1',
                        template.id === 'business' && 'text-brand-700',
                        template.id === 'lively' && 'text-copper-700',
                        template.id === 'simple' && 'text-ink-800'
                      )}>
                        {template.name}
                      </div>
                      <div className="text-xs text-ink-500">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="w-[45%] flex-shrink-0 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-ink-100">
              {aiTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAiTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all border-b-2',
                      activeAiTab === tab.id
                        ? 'text-brand-700 border-brand-600 bg-brand-50/30'
                        : 'text-ink-500 border-transparent hover:text-ink-700 hover:bg-ink-50'
                    )}
                  >
                    <Icon size={16} />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeAiTab === 'title' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-700">核心关键词</label>
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="输入核心关键词，多个用逗号分隔"
                      className="input-base"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateTitles}
                    disabled={isGenerating}
                    className="btn-primary w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        批量生成标题
                      </>
                    )}
                  </button>

                  <div className="space-y-2 pt-2">
                    {isGenerating && Array.from({ length: 3 }).map((_, i) => (
                      <ShimmerCard key={i} />
                    ))}
                    {generatedTitles.length > 0 && (
                      <div className="space-y-2 animate-stagger">
                        {generatedTitles.map((title, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-ink-50 hover:bg-ink-100/50 rounded-lg transition-colors group animate-slide-up"
                          >
                            <p className="flex-1 text-sm text-ink-700 leading-relaxed">{title}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => selectTitle(title)}
                                className="px-2 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                              >
                                选用
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(title, index)}
                                className="p-1 text-ink-400 hover:text-ink-600 transition-colors"
                              >
                                {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeAiTab === 'opening' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-700">选择风格</label>
                    <div className="flex flex-wrap gap-2">
                      {openingStyles.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedOpeningStyle(style.id)}
                          className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-full transition-all',
                            selectedOpeningStyle === style.id
                              ? 'bg-copper-600 text-white'
                              : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                          )}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-700">当前开头</label>
                    <div className="p-3 bg-ink-50 rounded-lg border border-ink-100">
                      <p className="text-sm text-ink-600 leading-relaxed">
                        {articleContent[0] || '（暂无内容，请在左侧编辑区输入开头）'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={generateOpenings}
                    disabled={isGenerating}
                    className="btn-primary w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        改写开头
                      </>
                    )}
                  </button>

                  <div className="space-y-2 pt-2">
                    {isGenerating && Array.from({ length: 3 }).map((_, i) => (
                      <ShimmerCard key={i} />
                    ))}
                    {generatedOpenings.length > 0 && (
                      <div className="space-y-2 animate-stagger">
                        {generatedOpenings.map((opening, index) => (
                          <div
                            key={index}
                            className="p-3 bg-ink-50 hover:bg-ink-100/50 rounded-lg transition-colors group animate-slide-up"
                          >
                            <p className="text-sm text-ink-700 leading-relaxed mb-2">{opening}</p>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => insertOpening(opening)}
                                className="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                              >
                                插入正文
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeAiTab === 'quote' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={extractQuotes}
                    disabled={isGenerating}
                    className="btn-primary w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Quote size={18} />
                        从正文中提炼金句
                      </>
                    )}
                  </button>

                  <div className="space-y-3 pt-2">
                    {isGenerating && Array.from({ length: 3 }).map((_, i) => (
                      <ShimmerCard key={i} />
                    ))}
                    {extractedQuotes.length > 0 && (
                      <div className="space-y-3 animate-stagger">
                        {extractedQuotes.map((quote, index) => (
                          <div
                            key={index}
                            className="relative p-4 bg-gradient-to-br from-copper-50 to-white rounded-xl border border-copper-100 group animate-slide-up"
                          >
                            <Quote
                              size={24}
                              className="absolute top-3 left-3 text-copper-300 opacity-50"
                            />
                            <p className="text-sm text-ink-700 leading-relaxed pl-6 pr-2 font-medium">
                              {quote}
                            </p>
                            <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => insertQuote(quote)}
                                className="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                              >
                                插入正文
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(quote, index + 100)}
                                className="px-3 py-1.5 text-xs font-medium text-ink-600 bg-ink-100 hover:bg-ink-200 rounded transition-colors"
                              >
                                {copiedIndex === index + 100 ? (
                                  <><Check size={12} className="inline mr-1" />已复制</>
                                ) : (
                                  <><Copy size={12} className="inline mr-1" />复制</>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeAiTab === 'preview' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-[280px] bg-ink-900 rounded-[2.5rem] p-2 shadow-xl">
                      <div className="bg-white rounded-[2rem] overflow-hidden">
                        <div className="h-6 bg-ink-900 flex items-center justify-center">
                          <div className="w-20 h-1.5 bg-ink-700 rounded-full" />
                        </div>
                        <div className="h-[420px] overflow-y-auto p-5 bg-ink-50">
                          <div className="space-y-4">
                            {articleTitle ? (
                              <h2
                                className={cn(
                                  'font-serif text-xl font-bold',
                                  getTitleStyle(selectedTemplate)
                                )}
                                style={{ fontFamily: "'Noto Serif SC', serif" }}
                              >
                                {articleTitle}
                              </h2>
                            ) : (
                              <div className="h-6 bg-ink-200 rounded w-3/4 animate-pulse" />
                            )}

                            <div className="space-y-3">
                              {contentItems.map((item) => (
                                <div key={item.id}>
                                  {item.type === 'paragraph' ? (
                                    item.content ? (
                                      <p className={cn('text-sm', getParagraphStyle(selectedTemplate))}>
                                        {item.content}
                                      </p>
                                    ) : (
                                      <div className="h-3 bg-ink-200 rounded w-full animate-pulse" />
                                    )
                                  ) : (
                                    <div className="aspect-video bg-ink-200 rounded-lg flex items-center justify-center">
                                      {item.thumbnail ? (
                                        <span className="text-4xl">{item.thumbnail}</span>
                                      ) : (
                                        <Image size={20} className="text-ink-400" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-ink-700 mb-2">切换模板预览</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {templateOptions.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template.id)}
                          className={cn(
                            'p-2 rounded-lg border-2 text-center text-xs font-medium transition-all',
                            selectedTemplate === template.id
                              ? 'border-copper-500 bg-copper-50 text-copper-700'
                              : 'border-ink-200 text-ink-600 hover:border-ink-300'
                          )}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-ink-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="brand">{templateOptions.find(t => t.id === selectedTemplate)?.name}模板</Badge>
                      <Badge variant="copper">{articleContent.length} 段落</Badge>
                      <Badge variant="default">{contentItems.filter(i => i.type === 'image-placeholder').length} 配图</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
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

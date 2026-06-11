import type { Material, Tag } from '../types';

export const tags: Tag[] = [
  { id: 'tag-1', name: '品牌', color: '#6366f1', count: 158 },
  { id: 'tag-2', name: '活动', color: '#f43f5e', count: 92 },
  { id: 'tag-3', name: '产品', color: '#10b981', count: 246 },
  { id: 'tag-4', name: '用户故事', color: '#f59e0b', count: 87 },
  { id: 'tag-5', name: '行业洞察', color: '#3b82f6', count: 64 },
  { id: 'tag-6', name: '节日', color: '#ec4899', count: 45 },
  { id: 'tag-7', name: '热点', color: '#ef4444', count: 78 },
  { id: 'tag-8', name: '教程', color: '#8b5cf6', count: 112 },
  { id: 'tag-9', name: '案例', color: '#14b8a6', count: 56 },
  { id: 'tag-10', name: '数据', color: '#f97316', count: 73 }
];

export const materials: Material[] = [
  {
    id: 'mat-1',
    title: '品牌主视觉KV图',
    type: 'image',
    content: '品牌官方主视觉设计图，适用于公众号头图和品牌推广',
    thumbnail: '🎨',
    source: '品牌部',
    tags: ['tag-1', 'tag-3'],
    createdAt: '2026-05-10',
    views: 1250
  },
  {
    id: 'mat-2',
    title: '618大促活动海报',
    type: 'image',
    content: '618年中大促活动宣传海报，多尺寸版本',
    thumbnail: '🏷️',
    source: '设计部',
    tags: ['tag-2', 'tag-7'],
    createdAt: '2026-06-01',
    views: 2680
  },
  {
    id: 'mat-3',
    title: '新品产品实拍图合集',
    type: 'image',
    content: '最新产品线实拍高清图片，包含场景图和细节图',
    thumbnail: '📸',
    source: '摄影部',
    tags: ['tag-3', 'tag-1'],
    createdAt: '2026-05-25',
    views: 1890
  },
  {
    id: 'mat-4',
    title: '用户使用场景照片',
    type: 'image',
    content: '真实用户在日常生活中使用产品的照片素材',
    thumbnail: '👥',
    source: '用户运营',
    tags: ['tag-4', 'tag-9'],
    createdAt: '2026-05-18',
    views: 960
  },
  {
    id: 'mat-5',
    title: '端午节节日海报模板',
    type: 'image',
    content: '端午节节日营销海报设计模板，可编辑文案',
    thumbnail: '🐲',
    source: '设计部',
    tags: ['tag-6', 'tag-2'],
    createdAt: '2026-05-28',
    views: 720
  },
  {
    id: 'mat-6',
    title: '数据可视化信息图',
    type: 'image',
    content: '行业数据信息图表设计，展示市场趋势',
    thumbnail: '📊',
    source: '数据部',
    tags: ['tag-10', 'tag-5'],
    createdAt: '2026-05-20',
    views: 1580
  },
  {
    id: 'mat-7',
    title: '教程步骤示意图',
    type: 'image',
    content: '产品使用教程步骤分解示意图',
    thumbnail: '📝',
    source: '设计部',
    tags: ['tag-8', 'tag-3'],
    createdAt: '2026-06-05',
    views: 890
  },
  {
    id: 'mat-8',
    title: '品牌发布会现场照片',
    type: 'image',
    content: '新品发布会现场高清照片，含产品展示和嘉宾',
    thumbnail: '🎤',
    source: '公关部',
    tags: ['tag-1', 'tag-2'],
    createdAt: '2026-04-25',
    views: 2150
  },
  {
    id: 'mat-9',
    title: '产品评测对比表格图',
    type: 'image',
    content: '与竞品的参数对比可视化图表',
    thumbnail: '📋',
    source: '产品部',
    tags: ['tag-10', 'tag-3'],
    createdAt: '2026-06-02',
    views: 1420
  },
  {
    id: 'mat-10',
    title: '社交媒体传播配图',
    type: 'image',
    content: '适合朋友圈、微博传播的方形配图模板',
    thumbnail: '📱',
    source: '新媒体部',
    tags: ['tag-7', 'tag-1'],
    createdAt: '2026-06-08',
    views: 3250
  },
  {
    id: 'mat-11',
    title: '产品功能介绍文案',
    type: 'copy',
    content: '详细介绍产品核心功能卖点的文案，适用于产品文章和详情页。产品采用行业领先技术，在性能、体验、设计三大维度全面升级，为用户带来前所未有的使用感受。',
    tags: ['tag-3', 'tag-1'],
    createdAt: '2026-05-15',
    views: 680
  },
  {
    id: 'mat-12',
    title: '618大促活动文案',
    type: 'copy',
    content: '618年中大促营销文案，包含主标题、副标题和活动规则文案。全场低至5折起，满300减50，限时抢购不容错过！',
    tags: ['tag-2', 'tag-7'],
    createdAt: '2026-06-03',
    views: 1560
  },
  {
    id: 'mat-13',
    title: '品牌故事文案',
    type: 'copy',
    content: '品牌发展历程和核心理念介绍文案。我们始终坚持用户至上的原则，用匠心打造每一件产品，致力于为用户创造更美好的生活体验。',
    tags: ['tag-1', 'tag-4'],
    createdAt: '2026-04-20',
    views: 920
  },
  {
    id: 'mat-14',
    title: '用户证言文案',
    type: 'copy',
    content: '精选真实用户好评反馈文案。使用这款产品三个月了，效果真的超出预期！推荐给身边所有朋友，大家反馈都很好。——来自资深用户',
    tags: ['tag-4', 'tag-9'],
    createdAt: '2026-05-22',
    views: 780
  },
  {
    id: 'mat-15',
    title: '科普知识文案',
    type: 'copy',
    content: '行业相关科普知识文案，用通俗易懂的语言解释专业概念。很多人对这个概念存在误解，实际上它的原理并不复杂，只需要掌握这几点就能明白...',
    tags: ['tag-8', 'tag-5'],
    createdAt: '2026-05-30',
    views: 1150
  },
  {
    id: 'mat-16',
    title: '节日祝福文案',
    type: 'copy',
    content: '适用于各大节日的品牌祝福文案模板。值此佳节来临之际，我们谨代表全体员工，向您致以最诚挚的祝福和最衷心的感谢！',
    tags: ['tag-6', 'tag-1'],
    createdAt: '2026-05-26',
    views: 540
  },
  {
    id: 'mat-17',
    title: '热点事件借势文案',
    type: 'copy',
    content: '针对当前社会热点事件的品牌借势营销文案模板。每一个热点背后，都是用户真实的关注。我们始终与用户同频，用产品回应期待。',
    tags: ['tag-7', 'tag-1'],
    createdAt: '2026-06-06',
    views: 2380
  },
  {
    id: 'mat-18',
    title: '使用教程文案',
    type: 'copy',
    content: '详细的产品使用步骤说明文案。第一步：开箱检查配件是否齐全；第二步：按照说明书完成初始化设置；第三步：下载配套App连接设备...',
    tags: ['tag-8', 'tag-3'],
    createdAt: '2026-05-12',
    views: 1620
  },
  {
    id: 'mat-19',
    title: '数据报告核心文案',
    type: 'copy',
    content: '行业数据报告核心观点总结文案。根据最新数据显示，今年市场规模预计将同比增长28%，其中下沉市场贡献了主要增量...',
    tags: ['tag-10', 'tag-5'],
    createdAt: '2026-06-04',
    views: 890
  },
  {
    id: 'mat-20',
    title: '案例分析文案',
    type: 'copy',
    content: '典型用户案例深度分析文案。这位用户从最初的尝试到成为忠实粉丝，背后的故事值得我们深入分析和学习...',
    tags: ['tag-9', 'tag-4'],
    createdAt: '2026-05-28',
    views: 760
  },
  {
    id: 'mat-21',
    title: '品质生活，从选择开始',
    type: 'quote',
    content: '品质生活，从选择开始。',
    tags: ['tag-1'],
    createdAt: '2026-04-15',
    views: 320
  },
  {
    id: 'mat-22',
    title: '科技改变生活，创新引领未来',
    type: 'quote',
    content: '科技改变生活，创新引领未来。',
    tags: ['tag-1', 'tag-5'],
    createdAt: '2026-04-18',
    views: 450
  },
  {
    id: 'mat-23',
    title: '每一次选择，都是对更好生活的追求',
    type: 'quote',
    content: '每一次选择，都是对更好生活的追求。',
    tags: ['tag-4', 'tag-1'],
    createdAt: '2026-05-02',
    views: 380
  },
  {
    id: 'mat-24',
    title: '用心做好每一件事，时间会给你答案',
    type: 'quote',
    content: '用心做好每一件事，时间会给你答案。',
    tags: ['tag-9', 'tag-4'],
    createdAt: '2026-05-08',
    views: 290
  },
  {
    id: 'mat-25',
    title: '美从来不是奢侈品，而是一种生活态度',
    type: 'quote',
    content: '美从来不是奢侈品，而是一种生活态度。',
    tags: ['tag-1', 'tag-8'],
    createdAt: '2026-05-14',
    views: 520
  },
  {
    id: 'mat-26',
    title: '数据不会说谎，好产品自己会说话',
    type: 'quote',
    content: '数据不会说谎，好产品自己会说话。',
    tags: ['tag-10', 'tag-3'],
    createdAt: '2026-05-20',
    views: 410
  },
  {
    id: 'mat-27',
    title: '竞品新品发布会深度解读',
    type: 'competitor',
    content: '竞品最新发布会完整分析，包括产品参数、定价策略、营销亮点等。竞品本次发布会的最大亮点是全新升级的旗舰芯片，性能提升30%，但售价保持不变，这对我们的产品定价策略有一定参考价值...',
    source: '行业分析',
    tags: ['tag-5', 'tag-10', 'tag-3'],
    createdAt: '2026-06-02',
    views: 1280
  },
  {
    id: 'mat-28',
    title: '竞品618营销策略分析',
    type: 'competitor',
    content: '详细分析竞品在618大促期间的营销活动、定价策略、用户互动方式。竞品采用了预售+定金膨胀+直播间专属优惠的组合策略，预售首日订单量突破10万...',
    source: '市场部',
    tags: ['tag-2', 'tag-7', 'tag-10'],
    createdAt: '2026-06-05',
    views: 1650
  },
  {
    id: 'mat-29',
    title: '竞品社交媒体运营策略',
    type: 'competitor',
    content: '竞品在微信、微博、抖音、小红书等平台的运营策略分析报告。竞品在小红书平台采用KOL种草+素人铺量的策略，笔记互动率远超行业平均水平...',
    source: '新媒体部',
    tags: ['tag-5', 'tag-9'],
    createdAt: '2026-05-25',
    views: 980
  },
  {
    id: 'mat-30',
    title: '竞品用户评价汇总分析',
    type: 'competitor',
    content: '收集整理各电商平台竞品用户评价，分析用户痛点和满意度。从评价来看，用户对竞品的外观设计评价较高，但在续航和售后方面抱怨较多...',
    source: '用户研究',
    tags: ['tag-4', 'tag-10', 'tag-3'],
    createdAt: '2026-05-30',
    views: 870
  },
  {
    id: 'mat-31',
    title: '竞品产品迭代路线图分析',
    type: 'competitor',
    content: '根据公开信息和行业情报整理的竞品产品迭代路线图分析。竞品预计在Q3推出两款新品，分别主打性价比和高端旗舰市场，其中高端机型将搭载全新自研芯片...',
    source: '产品部',
    tags: ['tag-3', 'tag-5'],
    createdAt: '2026-06-08',
    views: 1120
  },
  {
    id: 'mat-32',
    title: '竞品品牌联名活动盘点',
    type: 'competitor',
    content: '2026年竞品品牌联名活动盘点分析。竞品今年以来已进行了5次品牌联名，涵盖时尚、艺术、体育等多个领域，有效提升了品牌年轻度...',
    source: '品牌部',
    tags: ['tag-1', 'tag-2', 'tag-9'],
    createdAt: '2026-05-18',
    views: 760
  }
];

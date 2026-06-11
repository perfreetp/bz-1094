import { create } from 'zustand';
import type {
  Account,
  AccountGroup,
  Article,
  Task,
  Material,
  Tag,
  ReviewComment,
  PublishRecord,
  User,
  MaterialType,
  MaterialPackage,
} from '../types';
import {
  accounts,
  groups,
  articles,
  tasks,
  materials,
  tags,
  reviewComments,
  publishRecords,
  users,
  currentUser,
} from '../data';

interface AppState {
  accounts: Account[];
  groups: AccountGroup[];
  selectedGroupId: string | null;
  articles: Article[];
  tasks: Task[];
  materials: Material[];
  materialPackages: MaterialPackage[];
  tags: Tag[];
  selectedMaterialType: MaterialType | 'all';
  reviewComments: ReviewComment[];
  publishRecords: PublishRecord[];
  users: User[];
  currentUser: User;

  setSelectedGroup: (id: string | null) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  claimArticle: (articleId: string, userId: string) => void;
  addMaterialTag: (materialId: string, tagId: string) => void;
  addReviewComment: (comment: Omit<ReviewComment, 'id' | 'createdAt'>) => void;
  resolveComment: (commentId: string) => void;
  toggleResolveComment: (commentId: string) => void;
  retryPublish: (recordId: string) => void;
  setSelectedMaterialType: (type: MaterialType | 'all') => void;
  updateArticleContent: (articleId: string, content: string) => void;
  toggleMaterialTag: (materialId: string, tagId: string) => void;
  addMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => void;
  createMaterialPackage: (pkg: Omit<MaterialPackage, 'id' | 'createdAt'>) => void;
  addMaterialsToPackage: (packageId: string, materialIds: string[]) => void;
  removeMaterialsFromPackage: (packageId: string, materialIds: string[]) => void;
  deleteMaterialPackage: (packageId: string) => void;
}

const statusProgressMap: Record<string, number> = {
  todo: 0,
  draft: 0,
  writing: 50,
  review: 80,
  scheduled: 95,
  published: 100,
  archived: 100,
};

const taskStatusToArticleStatus: Record<string, Article['status']> = {
  todo: 'draft',
  writing: 'writing',
  review: 'review',
  scheduled: 'scheduled',
  published: 'published',
  archived: 'archived',
};

const samplePackages: MaterialPackage[] = [
  {
    id: 'pkg-1',
    name: '618 大促素材包',
    materialIds: ['mat-1', 'mat-2', 'mat-5', 'mat-13'],
    accountId: 'acc-1',
    category: '产品评测',
    createdAt: '2026-06-01',
    createdBy: 'u1',
    description: '618 活动期间的核心素材合集',
  },
  {
    id: 'pkg-2',
    name: '夏日护肤专题',
    materialIds: ['mat-10', 'mat-14', 'mat-15'],
    accountId: 'acc-5',
    category: '护肤教程',
    createdAt: '2026-06-05',
    createdBy: 'u2',
    description: '油皮、干皮夏季护肤素材',
  },
];

export const useAppStore = create<AppState>((set) => ({
  accounts,
  groups,
  selectedGroupId: null,
  articles,
  tasks,
  materials,
  materialPackages: samplePackages,
  tags,
  selectedMaterialType: 'all',
  reviewComments,
  publishRecords,
  users,
  currentUser,

  setSelectedGroup: (id) => set({ selectedGroupId: id }),

  updateTaskStatus: (taskId, status) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const updatedTasks = state.tasks.map((t) =>
        t.id === taskId ? { ...t, status, progress: statusProgressMap[status] ?? t.progress ?? 0 } : t
      );

      const articleStatus = (taskStatusToArticleStatus[status] || task.status) as Article['status'];
      const updatedArticles = state.articles.map((a) =>
        a.id === task.articleId
          ? {
              ...a,
              status: articleStatus,
              assignee: a.assignee ?? task.assignee,
            }
          : a
      );

      return { tasks: updatedTasks, articles: updatedArticles };
    }),

  claimArticle: (articleId, userId) =>
    set((state) => {
      const updatedArticles = state.articles.map((a) =>
        a.id === articleId ? { ...a, assignee: userId, status: 'writing' as const } : a
      );
      const updatedTasks = state.tasks.map((t) =>
        t.articleId === articleId ? { ...t, assignee: userId, status: 'writing' as const, progress: 50 } : t
      );
      return { articles: updatedArticles, tasks: updatedTasks };
    }),

  addMaterialTag: (materialId, tagId) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === materialId && !m.tags.includes(tagId)
          ? { ...m, tags: [...m.tags, tagId] }
          : m
      ),
    })),

  addReviewComment: (comment) =>
    set((state) => ({
      reviewComments: [
        ...state.reviewComments,
        {
          ...comment,
          id: `c${Date.now()}`,
          createdAt: new Date().toLocaleString('zh-CN'),
        },
      ],
    })),

  resolveComment: (commentId) =>
    set((state) => {
      const resolveReplies = (comments: ReviewComment[]): ReviewComment[] =>
        comments.map((c) => ({
          ...c,
          ...(c.id === commentId ? { resolved: true } : {}),
          replies: c.replies ? resolveReplies(c.replies) : undefined,
        }));
      return { reviewComments: resolveReplies(state.reviewComments) };
    }),

  toggleResolveComment: (commentId) =>
    set((state) => {
      const toggleReplies = (comments: ReviewComment[]): ReviewComment[] =>
        comments.map((c) => ({
          ...c,
          ...(c.id === commentId ? { resolved: !c.resolved } : {}),
          replies: c.replies ? toggleReplies(c.replies) : undefined,
        }));
      return { reviewComments: toggleReplies(state.reviewComments) };
    }),

  retryPublish: (recordId) =>
    set((state) => ({
      publishRecords: state.publishRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'pending', retryCount: r.retryCount + 1, errorMessage: undefined }
          : r
      ),
    })),

  setSelectedMaterialType: (type) => set({ selectedMaterialType: type }),

  updateArticleContent: (articleId, content) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === articleId ? { ...a, content } : a)),
    })),

  toggleMaterialTag: (materialId, tagId) =>
    set((state) => {
      const material = state.materials.find((m) => m.id === materialId);
      const hasTag = material?.tags.includes(tagId);
      const updatedTags = state.tags.map((t) => {
        const count = state.materials.reduce((n, m) => {
          if (m.id === materialId) {
            return hasTag ? n : n + (m.tags.includes(t.id) ? 1 : 0) + 1;
          }
          return n + (m.tags.includes(t.id) ? 1 : 0);
        }, 0);
        return { ...t, count };
      });
      return {
        materials: state.materials.map((m) =>
          m.id === materialId
            ? {
                ...m,
                tags: hasTag ? m.tags.filter((t) => t !== tagId) : [...m.tags, tagId],
              }
            : m
        ),
        tags: updatedTags,
      };
    }),

  addMaterial: (material) =>
    set((state) => ({
      materials: [
        ...state.materials,
        {
          ...material,
          id: `mat-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
    })),

  createMaterialPackage: (pkg) =>
    set((state) => ({
      materialPackages: [
        ...state.materialPackages,
        {
          ...pkg,
          id: `pkg-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
    })),

  addMaterialsToPackage: (packageId, materialIds) =>
    set((state) => ({
      materialPackages: state.materialPackages.map((p) =>
        p.id === packageId
          ? { ...p, materialIds: [...new Set([...p.materialIds, ...materialIds])] }
          : p
      ),
    })),

  removeMaterialsFromPackage: (packageId, materialIds) =>
    set((state) => ({
      materialPackages: state.materialPackages.map((p) =>
        p.id === packageId
          ? { ...p, materialIds: p.materialIds.filter((id) => !materialIds.includes(id)) }
          : p
      ),
    })),

  deleteMaterialPackage: (packageId) =>
    set((state) => ({
      materialPackages: state.materialPackages.filter((p) => p.id !== packageId),
    })),
}));

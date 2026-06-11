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

export const useAppStore = create<AppState>((set) => ({
  accounts,
  groups,
  selectedGroupId: null,
  articles,
  tasks,
  materials,
  tags,
  selectedMaterialType: 'all',
  reviewComments,
  publishRecords,
  users,
  currentUser,

  setSelectedGroup: (id) => set({ selectedGroupId: id }),

  updateTaskStatus: (taskId, status) =>
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, status, progress: statusProgressMap[status] ?? task.progress ?? 0 } : task
      );
      const task = state.tasks.find((t) => t.id === taskId);
      const updatedArticles = task
        ? state.articles.map((article) =>
            article.id === task.articleId ? { ...article, status: status as Article['status'] } : article
          )
        : state.articles;
      return { tasks: updatedTasks, articles: updatedArticles };
    }),

  claimArticle: (articleId, userId) =>
    set((state) => {
      const user = state.users.find((u) => u.id === userId);
      const userName = user?.name || userId;
      return {
        articles: state.articles.map((article) =>
          article.id === articleId ? { ...article, assignee: userName, status: 'writing' } : article
        ),
        tasks: state.tasks.map((task) =>
          task.articleId === articleId ? { ...task, assignee: userName, status: 'writing' as const, progress: 50 } : task
        ),
      };
    }),

  addMaterialTag: (materialId, tagId) =>
    set((state) => ({
      materials: state.materials.map((material) =>
        material.id === materialId && !material.tags.includes(tagId)
          ? { ...material, tags: [...material.tags, tagId] }
          : material
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
        comments.map((comment) => ({
          ...comment,
          ...(comment.id === commentId ? { resolved: true } : {}),
          replies: comment.replies ? resolveReplies(comment.replies) : undefined,
        }));
      return { reviewComments: resolveReplies(state.reviewComments) };
    }),

  retryPublish: (recordId) =>
    set((state) => ({
      publishRecords: state.publishRecords.map((record) =>
        record.id === recordId
          ? { ...record, status: 'pending', retryCount: record.retryCount + 1, errorMessage: undefined }
          : record
      ),
    })),

  setSelectedMaterialType: (type) => set({ selectedMaterialType: type }),
}));

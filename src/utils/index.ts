import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Article, Task } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPercent(num: number): string {
  return `${(num * 100).toFixed(1)}%`;
}

export function getStatusText(status: Article['status'] | Task['status']): string {
  const map: Record<string, string> = {
    draft: '草稿',
    todo: '待撰写',
    writing: '撰写中',
    review: '待审核',
    scheduled: '待发布',
    published: '已发布',
    archived: '已归档',
  };
  return map[status] || status;
}

export function getPriorityText(priority: 'high' | 'medium' | 'low'): string {
  const map = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return map[priority];
}

export function getStatusColor(status: Article['status'] | Task['status']): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    todo: 'bg-slate-100 text-slate-700',
    writing: 'bg-blue-50 text-blue-700',
    review: 'bg-amber-50 text-amber-700',
    scheduled: 'bg-purple-50 text-purple-700',
    published: 'bg-green-50 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  const map = {
    high: 'bg-red-50 text-red-700',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-green-50 text-green-700',
  };
  return map[priority];
}

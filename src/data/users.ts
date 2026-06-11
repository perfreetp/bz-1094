import type { User } from '../types';

export const users: User[] = [
  {
    id: 'u1',
    name: '张明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangming',
    role: 'admin',
  },
  {
    id: 'u2',
    name: '李娜',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina',
    role: 'editor',
  },
  {
    id: 'u3',
    name: '王小芳',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangxiaofang',
    role: 'editor',
  },
  {
    id: 'u4',
    name: '陈伟',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenwei',
    role: 'editor',
  },
  {
    id: 'u5',
    name: '刘静',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liujing',
    role: 'reviewer',
  },
  {
    id: 'u6',
    name: '赵雪',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoxue',
    role: 'reviewer',
  },
  {
    id: 'u7',
    name: '赵强',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoqiang',
    role: 'editor',
  },
];

export const currentUser: User = users[0];

export const usersById: Record<string, User> = Object.fromEntries(
  users.map(user => [user.id, user])
);

export const usersByName: Record<string, User> = Object.fromEntries(
  users.map(user => [user.name, user])
);

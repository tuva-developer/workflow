// Initial mock data for users
export const mockUsers: User[] = [
  {
    userId: 'user-admin',
    roles: ['Admin', 'Editor', 'Executor'],
    permissions: ['models.read', 'models.write', 'instances.read', 'instances.execute'],
    joined_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-02-01T00:00:00.000Z',
  },
  {
    userId: 'user-john',
    roles: ['Editor', 'Executor'],
    permissions: ['models.read', 'instances.read', 'instances.execute'],
    joined_at: '2024-01-10T00:00:00.000Z',
    updated_at: '2024-02-05T00:00:00.000Z',
  },
];



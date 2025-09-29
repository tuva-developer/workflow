export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type PaginateParams<T> = {
  items: T[];
  page?: number;
  limit?: number;
};

export function paginate<T>({ items, page = 1, limit = items.length || 10 }: PaginateParams<T>) {
  const start = (page - 1) * limit;
  const end = start + limit;
  const slice = items.slice(start, end);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items: slice,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

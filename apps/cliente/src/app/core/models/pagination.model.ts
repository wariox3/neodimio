export interface PaginatedResponse<T> {
  total: number;
  page: number;
  size: number;
  items: T[];
}

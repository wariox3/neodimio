export interface PaginatedResponse<T> {
  total: number;
  page: number;
  size: number;
  items: T[];
}

export interface QueryParams {
  page?: number;
  size?: number;
  [key: string]: string | number | boolean | null | undefined;
}

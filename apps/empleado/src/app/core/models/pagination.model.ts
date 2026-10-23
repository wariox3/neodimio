export interface PaginatedResponse<T> {
  total: number;
  page: number;
  size: number;
  items: T[];
}

export interface BaseQueryParams {
  page?: number;
  size?: number;
  empleado_id: number;
}

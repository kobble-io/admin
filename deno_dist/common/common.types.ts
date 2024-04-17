export type Paginated<T = unknown> = {
  total: number;
  count: number;
  page: number;
  data: T[];
  hasNext: boolean;
};

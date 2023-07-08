export interface IQuery {
  limit: number;
  offset: number;
  orderBy: 'createdAt' | 'name' | 'email';
  sortBy: 1 | -1;
  filters: any;
}

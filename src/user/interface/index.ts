export interface IQuery {
  limit: number;
  offset: number;
  orderBy: 'createdAt' | 'name' | 'email';
  sortBy: 'desc' | 'asc';
  filters: any;
}

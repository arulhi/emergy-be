export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: IPaginatedMeta;
}

export interface IPaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JwtUser {
  id: string;
  username: string;
  email: string;
  role: string;
  institutionId?: string;
}

export type ApiEnvelope<T> = {
  success: true;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

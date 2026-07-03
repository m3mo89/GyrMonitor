export type ApiSuccess<T> = {
  success: true;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function apiError(code: string, message: string): ApiError {
  return {
    success: false,
    error: {
      code,
      message
    }
  };
}

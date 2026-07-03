export abstract class DomainError extends Error {
  readonly httpStatus: number;
  readonly code: string;

  protected constructor(message: string, httpStatus: number, code: string) {
    super(message);
    this.httpStatus = httpStatus;
    this.code = code;
    this.name = new.target.name;
  }
}

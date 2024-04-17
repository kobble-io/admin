export class ErrorBase<T extends string> extends Error {
  public name: T;
  public message: string;
  public cause: unknown;

  constructor({
    name,
    message,
    cause,
  }: {
    name: T;
    message: string;
    cause: unknown;
  }) {
    super(message);

    this.message = message;
    this.name = name;
    this.cause = cause;
  }
}

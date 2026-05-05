export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Unnexpected internal error", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Try again later or contact support if the problem persists.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

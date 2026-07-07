export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Unnexpected internal error", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Try again later or contact support if the problem persists.";
    this.statusCode = statusCode || 500;
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

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service currently unavailable.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Check if the dependent services are running and healthy.";
    this.statusCode = 503;
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

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "A validation error ocurred", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Check the input values and try again.";
    this.statusCode = 400;
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

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Resource not found", {
      cause,
    });
    this.name = "NotFoundError";
    this.action = action || "Check the resource identifier and try again.";
    this.statusCode = 404;
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

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "User not authenticated", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action || "Check the fields and try again.";
    this.statusCode = 401;
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
export class MethodNotAllowedError extends Error {
  constructor() {
    super("Method not allowed");
    this.name = "MethodNotAllowedError";
    this.action =
      "Check the API documentation for the allowed methods and endpoints.";
    this.statusCode = 405;
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

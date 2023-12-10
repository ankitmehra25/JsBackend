class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", stack = "", errors = [], data = null) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.data = data;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;

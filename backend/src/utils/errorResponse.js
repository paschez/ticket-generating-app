class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorResponse = (message, statusCode = 500, details = null) => {
  return new AppError(message, statusCode, details);
};

export { AppError };
export default errorResponse;

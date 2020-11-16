class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // to know that the error was created from the app
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

class AppError extends Error {
  private statusCode;
  private status;
  private isOperational;
  private errors;
  constructor(message, statusCode, errors = undefined) {
    // console.log({ message });
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.message = message;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
// module.exports = AppError;

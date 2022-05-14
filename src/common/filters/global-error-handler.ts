import AppError from './app-error';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';

export const handleNotFoundError = (req: Request, res: Response, next: any) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      HttpStatus.NOT_FOUND,
    ),
  );
};

export const handleCastErrorDB = (err: any) => {
  // let error = {};
  const message = `Invalid ${err.path}: ${err.value}.`;
  // error[err.path] = message;
  return { error: message, statusCode: HttpStatus.BAD_REQUEST, message };
};

export const handleDuplicateFieldsDB = (err: any) => {
  const key = Object.keys(err?.keyValue)[0];
  const value = err?.keyValue[key];
  const valError = [];
  valError.push(`Duplicate value: ${value}. Please use another value!`);

  const message = `Duplicate field ${key} value: ${value}. Please use another value!`;
  return {
    error: message,
    statusCode: HttpStatus.BAD_REQUEST,
    message: valError,
  };
};

export const handleBadProjectionDB = (err: any) => {
  // let key = Object.keys(err?.keyValue)[0];
  // let value = err?.keyValue[key]
  // let valError = [];
  // valError.push(`Duplicate value: ${value}. Please use another value!`);

  const message = `Bad Query!`;
  return {
    error: message,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message,
  };
};

export const handleValidationErrorDB = (err: any) => {
  const valErrors = [];

  // el.path is the field the error occurs in while `el.message.replace('Path `', 'Field `')` is the error message
  // `valErrors[el.path] = el.message.replace('Path `', 'Field `')` adds a key to valErrors and the value of the new key is the error message

  Object.values(err.errors).forEach((el: any) => {
    valErrors.push(el.message.replace('Path `', 'Field `'));
  });

  const message = `Invalid input fields. ${Object.keys(err?.errors).join(
    ', ',
  )}`;

  return {
    error: message,
    statusCode: HttpStatus.BAD_REQUEST,
    message: valErrors,
  };
};

export const handleConflictingUpdateOperatorsDB = (err) => {
  // let valErrors = [];

  const message = `Invalid update query.`;
  return {
    error: message,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message,
  };
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', HttpStatus.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired! Please log in again.',
    HttpStatus.UNAUTHORIZED,
  );

const sendErrorDev = (err: any, res: Response) => {
  // console.log(err)
  res.status(err?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: err?.status,
    errors: err?.errors,
    message: err?.message,
    err,
    // stack: err.stack
  });
};

const sendErrorProd = (err: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: err?.status,
      message: err?.message,
      errors: err?.errors,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const errHandler = (err: any) => {
  err.statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.code = err.code;
  error.name = err.name;

  // console.log(error)

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (error.name === 'MongooseServerSelectionError')
    error = {
      error: 'Forbidden Access',
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Forbidden Access',
    };

  return error;
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: any,
) => {
  const error = errHandler(err);

  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    sendErrorDev(error, res);
  } else if (env === 'production') {
    sendErrorProd(error, res);
  }
};

// module.exports = globalErrorHandler
export default globalErrorHandler;

import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import {
  handleCastErrorDB,
  handleValidationErrorDB,
} from './global-error-handler';
import * as MongooseError from 'mongoose/lib/error';

@Catch(MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse();
    let err;

    switch (exception.name) {
      case 'ValidatorError':
        err = handleValidationErrorDB(exception);
      case 'ValidationError':
        err = handleValidationErrorDB(exception);
      case 'CastError':
        err = handleCastErrorDB(exception);
      // duplicate exception
      // do whatever you want here, for instance send error to client
    }

    return response.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
  }
}

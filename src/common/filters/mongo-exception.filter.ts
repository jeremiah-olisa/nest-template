import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import {
  handleBadProjectionDB,
  handleConflictingUpdateOperatorsDB,
  handleDuplicateFieldsDB,
} from './global-error-handler';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse();
    let err;

    switch (exception.code) {
      case 11000:
        err = handleDuplicateFieldsDB(exception);
      case 31254:
        err = handleBadProjectionDB(exception);
      case 40:
        err = handleConflictingUpdateOperatorsDB(exception);
      // duplicate exception
      // do whatever you want here, for instance send error to client
    }

    console.log('exception', exception);

    return response.status(err?.statusCode || 500).json({
      statusCode: err?.statusCode || 500,
      message: err?.message || 'Unknown Error',
      error: err?.error || 'Error',
    });
  }
}

import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { Error } from 'mongoose';
import { handleValidationErrorDB } from './global-error-handler';
import ValidationError = Error.ValidationError;

@Catch(ValidationError)
export class ValidationErrorFilter implements RpcExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse();

    // console.log(exception.errors);
    const err = handleValidationErrorDB(exception);

    return response.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
  }
}

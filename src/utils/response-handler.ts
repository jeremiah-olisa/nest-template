import { Response } from './../common/types/response.type';
import { Response as HttpResponse } from 'express';
import { HttpStatus } from '@nestjs/common';
import AppError from './app-error';

export type HttpAction = 'create' | 'read' | 'update' | 'delete';

const response = {
  success: function <TData, TMeta>(
    data,
    meta = undefined,
  ): Response<TData, TMeta> {
    return {
      data,
      success: true,
      ...meta,
    } as Response<TData, TMeta>;
  },

  error: function <TData, TMeta>(
    data,
    meta = undefined,
  ): Response<TData, TMeta> {
    return {
      data,
      success: false,
      ...meta,
    } as Response<TData, TMeta>;
  },

  send: function <TData, TMeta>(
    response: Response<TData, TMeta>,
    res: HttpResponse,
    action: HttpAction,
    statusCode?: number,
  ) {
    let status: number = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    if (!statusCode) {
      if (!response.success && Array.isArray(response?.message))
        status = HttpStatus.BAD_REQUEST;
      if (response.success == false) status = HttpStatus.BAD_REQUEST;
      if (response.success == false && response.data == null)
        status = HttpStatus.NOT_FOUND;
      if (
        response.success == true &&
        response.data != null &&
        action === 'create'
      )
        status = HttpStatus.CREATED;
      if (
        response.success == true &&
        response.data != null &&
        (action === 'read' || action === 'update')
      )
        status = HttpStatus.OK;
      if (
        response.success == true &&
        response.data != null &&
        action === 'delete'
      )
        status = HttpStatus.NO_CONTENT;
    }

    return res.status(status).send(response);
  },

  sendResponse: function <TData, TMeta>(
    data: TData,
    res: HttpResponse,
    action: HttpAction,
    success: boolean = true,
    meta?: TMeta,
    statusCode?: number,
  ) {
    const response = { data, success, ...meta } as Response<TData, TMeta>;

    let status: number = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    if (!statusCode) {
      if (!response.success && Array.isArray(response?.message))
        status = HttpStatus.BAD_REQUEST;
      if (response.success == false) status = HttpStatus.BAD_REQUEST;
      if (response.success == false && response.data == null)
        status = HttpStatus.NOT_FOUND;
      if (
        response.success == true &&
        response.data != null &&
        action === 'create'
      )
        status = HttpStatus.CREATED;
      if (
        response.success == true &&
        response.data != null &&
        (action === 'read' || action === 'update')
      )
        status = HttpStatus.OK;
      if (
        response.success == true &&
        response.data != null &&
        action === 'delete'
      )
        status = HttpStatus.NO_CONTENT;
    }

    return res.status(status).send(response);
  },
};

export default response;

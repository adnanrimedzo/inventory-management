import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FxCurrencyError } from './fx-rate/domain/model/errors/FxCurrencyError';
import { TransferError } from './transfer/domain/model/errors/TransferError';
import { FxRateError } from './settlement/domain/model/errors/FxRateError';
import { LiquidityError } from './liquidity/domain/model/errors/LiquidityError';
import { RevenueError } from './revenue/domain/model/errors/RevenueError';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const [status, message] = (function () {
      if (exception instanceof HttpException) {
        return [
          (exception as HttpException).getStatus(),
          (exception as HttpException).message,
        ];
      } else if (exception instanceof TransferError) {
        return [HttpStatus.BAD_REQUEST, (exception as TransferError).message];
      } else if (exception instanceof FxCurrencyError) {
        return [HttpStatus.BAD_REQUEST, (exception as FxCurrencyError).message];
      } else if (exception instanceof FxRateError) {
        return [HttpStatus.BAD_REQUEST, (exception as FxRateError).message];
      } else if (exception instanceof LiquidityError) {
        return [HttpStatus.BAD_REQUEST, (exception as LiquidityError).message];
      } else if (exception instanceof RevenueError) {
        return [HttpStatus.BAD_REQUEST, (exception as RevenueError).message];
      } else {
        return [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'];
      }
    })();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

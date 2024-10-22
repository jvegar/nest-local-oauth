import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express-serve-static-core';

@Injectable()
export class ExpressThrottlerGuard extends ThrottlerGuard {
  public getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();
    return {
      req: http.getRequest<Request>(),
      res: http.getResponse<Response>(),
    };
  }
}

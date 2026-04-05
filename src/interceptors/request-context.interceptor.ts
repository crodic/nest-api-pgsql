import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    this.cls.set('user', req.user);
    this.cls.set('ip', req.ip);
    this.cls.set('userAgent', req.headers['user-agent']);
    this.cls.set('requestId', req.headers['x-request-id']);

    return next.handle();
  }
}

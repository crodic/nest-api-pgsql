import { IS_PUBLIC } from '@/constants/app.constant';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin-jwt') {
  constructor(
    private readonly cls: ClsService,
    private reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      const message = info?.message || 'Unauthorized';
      throw new UnauthorizedException(message);
    }

    const request = context.switchToHttp().getRequest();
    request.user = user;

    // Set CLS values
    this.cls.set('userId', user.id);

    return user;
  }
}

import { AdminUserEntity } from '@/api/admin-user/entities/admin-user.entity';
import { IS_PUBLIC, SKIP_POLICIES } from '@/constants/app.constant';
import {
  CHECK_POLICIES_KEY,
  CHECK_POLICIES_LOGIC_KEY,
  PolicyHandler,
  PolicyLogic,
} from '@/decorators/policies.decorator';
import { CaslAbilityFactory } from '@/libs/casl/ability.factory';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isSkipPolices = this.reflector.getAllAndOverride<boolean>(
      SKIP_POLICIES,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic || isSkipPolices) return true;

    const handlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const logic =
      this.reflector.get<PolicyLogic>(
        CHECK_POLICIES_LOGIC_KEY,
        context.getHandler(),
      ) || 'AND';

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AdminUserEntity }>();
    const user = request.user;

    const ability = this.caslFactory.createForUser(user);

    if (logic === 'OR') {
      return handlers.some((handler) => handler(ability));
    }

    return handlers.every((handler) => handler(ability));
  }
}

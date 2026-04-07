import { AdminUserEntity } from '@/api/admin-user/entities/admin-user.entity';
import { IS_PUBLIC } from '@/constants/app.constant';
import {
  CHECK_POLICIES_KEY,
  CHECK_ALL_POLICIES_KEY,
  CHECK_ANY_POLICIES_KEY,
  PolicyHandler,
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

    if (isPublic) return true;

    const policies =
      this.reflector.getAllAndOverride<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        [context.getHandler(), context.getClass()],
      ) || [];

    const allPolicies =
      this.reflector.getAllAndOverride<PolicyHandler[]>(
        CHECK_ALL_POLICIES_KEY,
        [context.getHandler(), context.getClass()],
      ) || [];

    const anyPolicies =
      this.reflector.getAllAndOverride<PolicyHandler[]>(
        CHECK_ANY_POLICIES_KEY,
        [context.getHandler(), context.getClass()],
      ) || [];

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AdminUserEntity }>();

    const ability = this.caslFactory.createForUser(request.user);

    if (policies.length && !policies.every((handler) => handler(ability))) {
      return false;
    }

    if (allPolicies.length && !allPolicies.every((handler) => handler(ability))) {
      return false;
    }

    if (anyPolicies.length && !anyPolicies.some((handler) => handler(ability))) {
      return false;
    }

    return true;
  }
}

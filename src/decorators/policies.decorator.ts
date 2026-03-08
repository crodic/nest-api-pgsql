import { AppAbility } from '@/libs/casl/ability.factory';
import { SetMetadata } from '@nestjs/common';

export interface PolicyHandler {
  (ability: AppAbility): boolean;
}

export const CHECK_POLICIES_KEY = 'check_policy';

export const CHECK_POLICIES_LOGIC_KEY = 'check_policy_logic';
export type PolicyLogic = 'AND' | 'OR';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

export const CheckPoliciesLogic = (logic: PolicyLogic) =>
  SetMetadata(CHECK_POLICIES_LOGIC_KEY, logic);

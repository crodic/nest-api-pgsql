import { ID } from '@/common/types/common.type';

export type JwtRefreshPayloadType = {
  sessionId: ID;
  hash: string;
  iat: number;
  exp: number;
};

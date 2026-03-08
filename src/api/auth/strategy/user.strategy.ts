import { AllConfigType } from '@/config/config.type';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<AllConfigType>('auth.userSecret', {
        infer: true,
      }),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const isSessionBlacklisted = await this.cache.get<boolean>(
      `session_blacklist:${payload.sessionId}`,
    );

    if (isSessionBlacklisted) {
      throw new UnauthorizedException();
    }

    return payload; // request.user
  }
}

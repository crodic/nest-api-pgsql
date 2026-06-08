import { AdminUserEntity } from '@/api/admin-user/entities/admin-user.entity';
import { AllConfigType } from '@/config/config.type';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<AllConfigType>('auth.secret', {
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

    const user = await this.adminUserRepository.findOne({
      where: { id: payload.id },
      relations: ['roles', 'roles.permissionEntities'],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      sessionId: payload.sessionId,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}

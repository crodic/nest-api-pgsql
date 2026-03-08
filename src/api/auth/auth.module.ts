import { QueueName, QueuePrefix } from '@/constants/job.constant';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from '../admin-user/entities/admin-user.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AdminAuthenticationController } from './controllers/admin-auth.controller';
import { UserAuthenticationController } from './controllers/user-auth.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { UserAuthService } from './services/user-auth.service';
import { AdminJwtStrategy } from './strategy/admin.strategy';
import { UserJwtStrategy } from './strategy/user.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AdminUserEntity]),
    JwtModule.register({}),
    BullModule.registerQueue({
      name: QueueName.EMAIL,
      prefix: QueuePrefix.AUTH,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
    BullBoardModule.forFeature({
      name: QueueName.EMAIL,
      adapter: BullMQAdapter,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AdminAuthenticationController, UserAuthenticationController],
  providers: [
    AdminAuthService,
    UserAuthService,
    AdminJwtStrategy,
    UserJwtStrategy,
  ],
  exports: [AdminAuthService, UserAuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../role/entities/role.entity';
import { AuthModule } from './../auth/auth.module';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminUserEntity } from './entities/admin-user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([RoleEntity, AdminUserEntity]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
})
export class AdminUserModule {}

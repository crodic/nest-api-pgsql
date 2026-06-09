import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { AuthModule } from './../auth/auth.module';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminUserEntity } from './entities/admin-user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity, AdminUserEntity]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
})
export class AdminUserModule {}

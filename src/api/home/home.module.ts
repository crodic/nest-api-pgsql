import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserService } from '../admin-user/admin-user.service';
import { AdminUserEntity } from '../admin-user/entities/admin-user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, AdminUserEntity])],
  controllers: [HomeController],
  providers: [RoleService, AdminUserService, HomeService],
})
export class HomeModule {}

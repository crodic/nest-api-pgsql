import { Module } from '@nestjs/common';
import { AdminUserModule } from './admin-user/admin-user.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { RoleModule } from './role/role.module';
import { SettingsModule } from './settings/settings.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    HealthModule,
    AuthModule,
    HomeModule,
    AuditLogModule,
    RoleModule,
    AdminUserModule,
    SettingsModule,
    FileModule,
  ],
})
export class ApiModule {}

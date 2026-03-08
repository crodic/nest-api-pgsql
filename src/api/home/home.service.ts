import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminUserService } from '../admin-user/admin-user.service';
import { RoleService } from '../role/role.service';
import { CreateSystemSetupReqDto } from './dto/create-system-setup.req.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly adminUserService: AdminUserService,
    private readonly roleService: RoleService,
  ) {}

  async initialStatus() {
    const [hasAdmin, hasRole] = await Promise.all([
      this.adminUserService.hasAdmin(),
      this.roleService.hasRole(),
    ]);

    const initialized = hasAdmin && hasRole;

    return {
      initialized,
      message: initialized
        ? 'System has been initialized'
        : 'System has not been initialized',
    };
  }

  async systemSetup(dto: CreateSystemSetupReqDto) {
    const [hasAdmin, hasRole] = await Promise.all([
      this.adminUserService.hasAdmin(),
      this.roleService.hasRole(),
    ]);

    if (hasAdmin || hasRole) {
      throw new HttpException(
        'System has already been initialized',
        HttpStatus.FORBIDDEN,
      );
    }

    const { username, email, password, systemRoleName } = dto;

    return await this.dataSource.transaction(async (manager) => {
      const role = await this.roleService.createWithManager(manager, {
        name: systemRoleName,
        permissions: ['manage:all'],
        description: 'System role',
      });

      await this.adminUserService.createWithManager(manager, {
        firstName: 'System',
        lastName: 'Administrator',
        username,
        email,
        password,
        roleId: role.id,
      });

      return { success: true, message: 'System initialized successfully' };
    });
  }
}

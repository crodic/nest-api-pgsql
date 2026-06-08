import {
  SUPER_ADMIN_ACCOUNT,
  SYSTEM_ROLE_NAME,
} from '@/constants/app.constant';
import {
  ADMIN_FULL_ACCESS,
  ALL_PERMISSIONS,
} from '@/utils/permissions.constant';
import { DataSource, In } from 'typeorm';
import type { Seeder } from 'typeorm-extension';

export class AdminSeeder1758099274256 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<void> {
    const { RoleEntity } = await import('@/api/role/entities/role.entity');
    const { PermissionEntity } =
      await import('@/api/role/entities/permission.entity');
    const { AdminUserEntity } =
      await import('@/api/admin-user/entities/admin-user.entity');

    const roleRepo = dataSource.getRepository(RoleEntity);
    const permissionRepo = dataSource.getRepository(PermissionEntity);
    const userRepo = dataSource.getRepository(AdminUserEntity);

    await permissionRepo.upsert(
      ALL_PERMISSIONS.map((permission) => ({
        label: permission.label,
        description: null,
        key: permission.key,
      })),
      ['key'],
    );

    const permissions = await permissionRepo.findBy({
      key: In([`${ADMIN_FULL_ACCESS.action}:${ADMIN_FULL_ACCESS.subject}`]),
    });

    let superAdminRole = await roleRepo.findOne({
      where: { name: SYSTEM_ROLE_NAME },
      relations: ['permissionEntities'],
    });

    if (!superAdminRole) {
      superAdminRole = roleRepo.create({
        name: SYSTEM_ROLE_NAME,
        description: 'System role',
        isSystem: true,
        permissionEntities: permissions,
      });
      await roleRepo.save(superAdminRole);
    } else {
      superAdminRole.isSystem = true;
      superAdminRole.permissionEntities = permissions;
      await roleRepo.save(superAdminRole);
    }

    const existingAdmin = await userRepo.findOne({
      where: { email: SUPER_ADMIN_ACCOUNT.email },
    });

    if (!existingAdmin) {
      const admin = userRepo.create({
        email: SUPER_ADMIN_ACCOUNT.email,
        firstName: 'System',
        lastName: 'Administrator',
        password: SUPER_ADMIN_ACCOUNT.password,
        roles: [superAdminRole],
        verifiedAt: new Date(),
      });
      await userRepo.save(admin);
    }
  }
}

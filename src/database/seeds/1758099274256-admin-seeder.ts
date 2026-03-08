import {
  SUPER_ADMIN_ACCOUNT,
  SYSTEM_ROLE_NAME,
  SYSTEM_USER_ID,
} from '@/constants/app.constant';
import { AppActions, AppSubjects } from '@/utils/permissions.constant';
import { DataSource } from 'typeorm';
import type { Seeder } from 'typeorm-extension';

export class AdminSeeder1758099274256 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<void> {
    const { RoleEntity } = await import('@/api/role/entities/role.entity');
    const { AdminUserEntity } = await import(
      '@/api/admin-user/entities/admin-user.entity'
    );

    const roleRepo = dataSource.getRepository(RoleEntity);
    const userRepo = dataSource.getRepository(AdminUserEntity);

    const permissions = [`${AppActions.Manage}:${AppSubjects.All}`];

    let superAdminRole = await roleRepo.findOne({
      where: { name: SYSTEM_ROLE_NAME },
    });

    if (!superAdminRole) {
      superAdminRole = roleRepo.create({
        name: SYSTEM_ROLE_NAME,
        description: 'System role',
        permissions,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      await roleRepo.save(superAdminRole);
    } else {
      superAdminRole.permissions = permissions;
      superAdminRole.updatedBy = SYSTEM_USER_ID;
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
        role: superAdminRole,
        verifiedAt: new Date(),
        username: SUPER_ADMIN_ACCOUNT.username,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      await userRepo.save(admin);
    }
  }
}

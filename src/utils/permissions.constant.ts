export enum AppSubjects {
  User = 'USER',
  Role = 'ROLE',
  Log = 'LOG',
  Admin = 'ADMIN',

  All = 'all',
}

export enum AppActions {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',

  // ⚡ SUPER
  Manage = 'manage',
}

const permissionMeta = (
  action: AppActions,
  subject: AppSubjects,
  group: string,
  name: string,
  description: string,
) => ({
  key: `${action}:${subject}`,
  group,
  name,
  description,
});

export const ALL_PERMISSIONS = [
  // Admin
  permissionMeta(
    AppActions.Read,
    AppSubjects.Admin,
    'Admin Management',
    'View admins',
    'View administrator accounts and their assigned roles.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Admin,
    'Admin Management',
    'Create admins',
    'Invite or create administrator accounts.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Admin,
    'Admin Management',
    'Update admins',
    'Edit administrator profile details, status, and role assignments.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Admin,
    'Admin Management',
    'Delete admins',
    'Remove administrator accounts from the system.',
  ),

  // User
  permissionMeta(
    AppActions.Read,
    AppSubjects.User,
    'User Management',
    'View users',
    'View customer or member user accounts.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.User,
    'User Management',
    'Create users',
    'Create customer or member user accounts.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.User,
    'User Management',
    'Update users',
    'Edit customer or member user account details.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.User,
    'User Management',
    'Delete users',
    'Remove customer or member user accounts.',
  ),

  // Role
  permissionMeta(
    AppActions.Read,
    AppSubjects.Role,
    'Role Management',
    'View roles',
    'View roles and their permission assignments.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Role,
    'Role Management',
    'Create roles',
    'Create roles and assign allowed permissions.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Role,
    'Role Management',
    'Update roles',
    'Edit role details and permission assignments.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Role,
    'Role Management',
    'Delete roles',
    'Remove roles that are no longer used.',
  ),

  // Log
  permissionMeta(
    AppActions.Read,
    AppSubjects.Log,
    'Audit & Activity',
    'View activity logs',
    'Review audit trails and activity history.',
  ),

  // SUPER
  permissionMeta(
    AppActions.Manage,
    AppSubjects.All,
    'System',
    'Full system access',
    'Reserved system permission with unrestricted access. Not assignable in role forms.',
  ),
];

export const ADMIN_FULL_ACCESS = {
  action: AppActions.Manage,
  subject: AppSubjects.All,
};

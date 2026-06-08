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

const permission = (key: string, label = key) => ({ name: key, key, label });

export const ALL_PERMISSIONS = [
  // Admin
  permission(`${AppActions.Read}:${AppSubjects.Admin}`),
  permission(`${AppActions.Create}:${AppSubjects.Admin}`),
  permission(`${AppActions.Update}:${AppSubjects.Admin}`),
  permission(`${AppActions.Delete}:${AppSubjects.Admin}`),

  // User
  permission(`${AppActions.Read}:${AppSubjects.User}`),
  permission(`${AppActions.Create}:${AppSubjects.User}`),
  permission(`${AppActions.Update}:${AppSubjects.User}`),
  permission(`${AppActions.Delete}:${AppSubjects.User}`),

  // Role
  permission(`${AppActions.Read}:${AppSubjects.Role}`),
  permission(`${AppActions.Create}:${AppSubjects.Role}`),
  permission(`${AppActions.Update}:${AppSubjects.Role}`),
  permission(`${AppActions.Delete}:${AppSubjects.Role}`),

  // Log
  permission(`${AppActions.Read}:${AppSubjects.Log}`),

  // SUPER
  permission(`${AppActions.Manage}:${AppSubjects.All}`),
];

export const ADMIN_FULL_ACCESS = {
  action: AppActions.Manage,
  subject: AppSubjects.All,
};

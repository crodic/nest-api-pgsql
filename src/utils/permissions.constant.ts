export enum AppSubjects {
  User = 'USER',
  Role = 'ROLE',
  Log = 'LOG',
  Admin = 'ADMIN',
  Dashboard = 'DASHBOARD',

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

export const ALL_PERMISSIONS = [
  // Admin
  { name: `${AppActions.Read}:${AppSubjects.Admin}` },
  { name: `${AppActions.Create}:${AppSubjects.Admin}` },
  { name: `${AppActions.Update}:${AppSubjects.Admin}` },
  { name: `${AppActions.Delete}:${AppSubjects.Admin}` },

  // User
  { name: `${AppActions.Read}:${AppSubjects.User}` },
  { name: `${AppActions.Create}:${AppSubjects.User}` },
  { name: `${AppActions.Update}:${AppSubjects.User}` },
  { name: `${AppActions.Delete}:${AppSubjects.User}` },

  // Role
  { name: `${AppActions.Read}:${AppSubjects.Role}` },
  { name: `${AppActions.Create}:${AppSubjects.Role}` },
  { name: `${AppActions.Update}:${AppSubjects.Role}` },
  { name: `${AppActions.Delete}:${AppSubjects.Role}` },

  // Log
  { name: `${AppActions.Read}:${AppSubjects.Log}` },

  // Dashboard
  { name: `${AppActions.Read}:${AppSubjects.Dashboard}` },

  // SUPER
  { name: `${AppActions.Manage}:${AppSubjects.All}` },
];

export const ADMIN_FULL_ACCESS = {
  action: AppActions.Manage,
  subject: AppSubjects.All,
};

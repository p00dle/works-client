export type UserRole = 
  | 'admin'
  | 'non-admin';

export const userRoles: UserRole[] = [
  'admin',
  'non-admin',
]

export interface User {
  uuid: string;
  username: string;
  role: 'admin' | 'non-admin';
  email: string;
  fullName: string;
  lastLogin: number;
  managerId: string;
  permissions: any; // json column typings not yet implemented;
}

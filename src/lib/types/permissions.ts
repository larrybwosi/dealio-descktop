// types/permissions.ts

import { CustomRole as PrismaCustomRole, MemberRole } from '@/prisma/client';

// Step 1: Define the scopes available in your application.
// This should be an exhaustive list of all entities that can have permissions.
const permissionScopes = [
  'organization',
  'member',
  'product',
  'sale',
  'purchase',
  'expense',
  'budget',
  'report',
  'settings',
  'role',
  'order',
  'customers',
  'location',
  '*', // Universal scope
] as const;

// Step 2: Define the actions that can be performed.
const permissionActions = [
  'create',
  'view',
  'edit',
  'delete',
  'manage', // A common action for full control over a scope
  'approve',
  'submit',
  'generate',
  'view:own', // More granular actions
  'manage:own',
  'create:own',
  '*', // Wildcard action
] as const;

// Step 3: Create the Template Literal Type for a single permission.
// This generates all possible combinations like "product:create", "sale:*", etc.
type PermissionScope = (typeof permissionScopes)[number];
type PermissionAction = (typeof permissionActions)[number];
export type Permission = `${PermissionScope}:${PermissionAction}` | '*';
export type CustomRole = {
  isActive : boolean
} & PrismaCustomRole
// Step 4 (Optional but recommended): A helper type for defining the permissions map.
export type RolePermissions = Record<MemberRole, Permission[]>;

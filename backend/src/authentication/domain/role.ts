export const Roles = {
  ADMIN: 'ADMIN',
  FIELD_OPERATOR: 'FIELD_OPERATOR',
  RESEARCHER: 'RESEARCHER',
  SYSTEM_GENERATOR: 'SYSTEM_GENERATOR'
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const approvedRoles: Role[] = [
  Roles.ADMIN,
  Roles.FIELD_OPERATOR,
  Roles.RESEARCHER,
  Roles.SYSTEM_GENERATOR
];

export function isRole(value: string): value is Role {
  return approvedRoles.includes(value as Role);
}

import type { UserRole } from '../users/user.entity';

export type JwtPayload = {
  sub: string;
  login: string;
  role: UserRole;
};

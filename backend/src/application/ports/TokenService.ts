import { UserRole } from '../../domain/entities/User';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export interface TokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}

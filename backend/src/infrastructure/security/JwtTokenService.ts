import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { AuthTokenPayload, TokenService } from '../../application/ports/TokenService';
import { AppError } from '../../domain/errors/AppError';
import { env } from '../../config/env';

export class JwtTokenService implements TokenService {
  sign(payload: AuthTokenPayload): string {
    const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.jwt.secret, options);
  }

  verify(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, env.jwt.secret);

      if (!this.isAuthTokenPayload(decoded)) {
        throw new AppError('Invalid token payload', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Invalid or expired token', 401);
    }
  }

  private isAuthTokenPayload(decoded: string | JwtPayload): decoded is AuthTokenPayload {
    return (
      typeof decoded === 'object' &&
      typeof decoded.sub === 'string' &&
      (decoded.role === 'admin' || decoded.role === 'staff')
    );
  }
}

import { RequestHandler } from 'express';
import { AppError } from '../../../domain/errors/AppError';
import { JwtTokenService } from '../../../infrastructure/security/JwtTokenService';
import { UserRole } from '../../../domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        role: UserRole;
      };
    }
  }
}

const tokenService = new JwtTokenService();

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.header('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('Missing bearer token', 401));
    return;
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const payload = tokenService.verify(token);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      next(new AppError('Invalid token payload', 401));
      return;
    }

    req.auth = {
      userId,
      role: payload.role
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeAdmin: RequestHandler = (req, _res, next) => {
  if (req.auth?.role !== 'admin') {
    next(new AppError('Admin permission required', 403));
    return;
  }

  next();
};

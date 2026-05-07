import { Router } from 'express';
import { body } from 'express-validator';
import { db } from '../../../config/db';
import { GetProfile } from '../../../application/use-cases/auth/GetProfile';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser } from '../../../application/use-cases/auth/RegisterUser';
import { MysqlUserRepository } from '../../../infrastructure/repositories/MysqlUserRepository';
import { BcryptPasswordHasher } from '../../../infrastructure/security/BcryptPasswordHasher';
import { JwtTokenService } from '../../../infrastructure/security/JwtTokenService';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const userRepository = new MysqlUserRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();
const authController = new AuthController(
  new RegisterUser(userRepository, passwordHasher, tokenService),
  new LoginUser(userRepository, passwordHasher, tokenService),
  new GetProfile(userRepository)
);

export const authRouter = Router();

authRouter.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 120 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8, max: 72 }),
    body('role').isIn(['admin', 'staff'])
  ],
  validate,
  authController.register
);

authRouter.post(
  '/login',
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 1, max: 72 })
  ],
  validate,
  authController.login
);

authRouter.get('/me', authenticate, authController.me);

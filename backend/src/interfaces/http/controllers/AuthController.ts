import { RequestHandler } from 'express';
import { AppError } from '../../../domain/errors/AppError';
import { GetProfile } from '../../../application/use-cases/auth/GetProfile';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser } from '../../../application/use-cases/auth/RegisterUser';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getProfile: GetProfile
  ) {}

  register: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.registerUser.execute(req.body);
      res.status(201).json({
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  login: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.json({
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  me: RequestHandler = async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new AppError('Authentication required', 401);
      }

      const user = await this.getProfile.execute(req.auth.userId);
      res.json({
        message: 'Profile loaded successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
}

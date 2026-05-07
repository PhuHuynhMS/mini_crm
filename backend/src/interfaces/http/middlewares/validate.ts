import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../../../domain/errors/AppError';

export const validate: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new AppError('Validation failed', 422, errors.array()));
    return;
  }

  next();
};

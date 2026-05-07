import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { db } from '../../../config/db';
import { authRouter } from './auth';
import { customersRouter } from './customers';
import { dashboardRouter } from './dashboard';
import { ordersRouter } from './orders';

interface HealthRow extends RowDataPacket {
  ok: number;
}

export const router = Router();

router.use('/auth', authRouter);
router.use('/customers', customersRouter);
router.use('/orders', ordersRouter);
router.use('/dashboard', dashboardRouter);

router.get('/health', async (_req, res, next) => {
  try {
    await db.query<HealthRow[]>('SELECT 1 AS ok');
    res.json({
      message: 'Mini CRM API is healthy',
      data: {
        database: 'connected'
      }
    });
  } catch (error) {
    next(error);
  }
});

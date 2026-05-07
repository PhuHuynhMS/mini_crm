import { Router } from 'express';
import { db } from '../../../config/db';
import { GetDashboardSummary } from '../../../application/use-cases/dashboard/GetDashboardSummary';
import { MysqlDashboardRepository } from '../../../infrastructure/repositories/MysqlDashboardRepository';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../middlewares/auth';

const dashboardRepository = new MysqlDashboardRepository(db);
const dashboardController = new DashboardController(
  new GetDashboardSummary(dashboardRepository)
);

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authenticate, dashboardController.summary);

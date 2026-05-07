import { RequestHandler } from 'express';
import { GetDashboardSummary } from '../../../application/use-cases/dashboard/GetDashboardSummary';

export class DashboardController {
  constructor(private readonly getDashboardSummary: GetDashboardSummary) {}

  summary: RequestHandler = async (_req, res, next) => {
    try {
      const summary = await this.getDashboardSummary.execute();
      res.json({
        message: 'Dashboard summary loaded successfully',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  };
}

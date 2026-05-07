import { DashboardSummary } from '../../domain/entities/Dashboard';

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}

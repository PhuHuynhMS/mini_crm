import { DashboardRepository } from '../../ports/DashboardRepository';

export class GetDashboardSummary {
  constructor(private readonly dashboard: DashboardRepository) {}

  execute() {
    return this.dashboard.getSummary();
  }
}

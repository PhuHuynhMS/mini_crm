import { RowDataPacket } from 'mysql2/promise';
import { DashboardRepository } from '../../application/ports/DashboardRepository';
import { DashboardSummary, OrderStatusCount } from '../../domain/entities/Dashboard';
import { OrderStatus } from '../../domain/entities/Order';
import { Database } from '../database/mysqlPool';

interface CountRow extends RowDataPacket {
  total: number;
}

interface RevenueRow extends RowDataPacket {
  total: number | null;
}

interface StatusCountRow extends RowDataPacket {
  status: OrderStatus;
  total: number;
}

const orderStatuses: OrderStatus[] = ['new', 'processing', 'completed', 'cancelled'];

export class MysqlDashboardRepository implements DashboardRepository {
  constructor(private readonly db: Database) {}

  async getSummary(): Promise<DashboardSummary> {
    const [[activeCustomers], [todayOrders], [monthlyRevenue], [statusRows]] = await Promise.all([
      this.db.query<CountRow[]>(
        `SELECT COUNT(*) AS total
         FROM customers
         WHERE status = 'active'`
      ),
      this.db.query<CountRow[]>(
        `SELECT COUNT(*) AS total
         FROM orders
         WHERE DATE(ordered_at) = CURRENT_DATE()`
      ),
      this.db.query<RevenueRow[]>(
        `SELECT COALESCE(SUM(total_amount), 0) AS total
         FROM orders
         WHERE status = 'completed'
           AND ordered_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
           AND ordered_at < DATE_ADD(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`
      ),
      this.db.query<StatusCountRow[]>(
        `SELECT status, COUNT(*) AS total
         FROM orders
         GROUP BY status`
      )
    ]);

    return {
      activeCustomers: activeCustomers[0]?.total || 0,
      todayOrders: todayOrders[0]?.total || 0,
      monthlyRevenue: Number(monthlyRevenue[0]?.total || 0),
      ordersByStatus: this.normalizeStatusCounts(statusRows)
    };
  }

  private normalizeStatusCounts(rows: StatusCountRow[]): OrderStatusCount[] {
    const counts = new Map<OrderStatus, number>(
      rows.map((row) => [row.status, row.total])
    );

    return orderStatuses.map((status) => ({
      status,
      total: counts.get(status) || 0
    }));
  }
}

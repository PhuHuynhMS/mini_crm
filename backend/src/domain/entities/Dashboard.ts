import { OrderStatus } from './Order';

export interface OrderStatusCount {
  status: OrderStatus;
  total: number;
}

export interface DashboardSummary {
  activeCustomers: number;
  todayOrders: number;
  monthlyRevenue: number;
  ordersByStatus: OrderStatusCount[];
}

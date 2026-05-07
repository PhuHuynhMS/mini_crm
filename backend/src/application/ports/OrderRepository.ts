import { Order, OrderDetail, OrderStatus } from '../../domain/entities/Order';
import { PaginatedResult } from '../../shared/pagination';

export interface ListOrdersFilter {
  status?: OrderStatus;
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface CreateOrderItemInput {
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  customerId: number;
  assignedTo?: number | null;
  status?: OrderStatus;
  notes?: string | null;
  items: CreateOrderItemInput[];
}

export interface OrderRepository {
  list(filter: ListOrdersFilter): Promise<PaginatedResult<Order>>;
  findById(id: number): Promise<Order | null>;
  findDetailById(id: number): Promise<OrderDetail | null>;
  create(input: CreateOrderInput, totalAmount: number): Promise<OrderDetail>;
  updateStatus(id: number, status: OrderStatus): Promise<Order | null>;
  delete(id: number): Promise<boolean>;
}

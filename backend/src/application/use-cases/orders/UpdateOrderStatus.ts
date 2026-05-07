import { AppError } from '../../../domain/errors/AppError';
import { OrderStatus } from '../../../domain/entities/Order';
import { OrderRepository } from '../../ports/OrderRepository';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  new: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

export class UpdateOrderStatus {
  constructor(private readonly orders: OrderRepository) {}

  async execute(id: number, status: OrderStatus) {
    const order = await this.orders.findById(id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === status) {
      return order;
    }

    if (!allowedTransitions[order.status].includes(status)) {
      throw new AppError(`Cannot change order status from ${order.status} to ${status}`, 422);
    }

    const updated = await this.orders.updateStatus(id, status);

    if (!updated) {
      throw new AppError('Order not found', 404);
    }

    return updated;
  }
}

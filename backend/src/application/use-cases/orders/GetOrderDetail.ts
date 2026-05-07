import { AppError } from '../../../domain/errors/AppError';
import { OrderRepository } from '../../ports/OrderRepository';

export class GetOrderDetail {
  constructor(private readonly orders: OrderRepository) {}

  async execute(id: number) {
    const order = await this.orders.findDetailById(id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }
}

import { AppError } from '../../../domain/errors/AppError';
import { OrderRepository } from '../../ports/OrderRepository';

export class DeleteOrder {
  constructor(private readonly orders: OrderRepository) {}

  async execute(id: number) {
    const deleted = await this.orders.delete(id);

    if (!deleted) {
      throw new AppError('Order not found', 404);
    }
  }
}

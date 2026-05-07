import { AppError } from '../../../domain/errors/AppError';
import { calculateOrderTotal } from '../../../domain/entities/Order';
import { CreateOrderInput, OrderRepository } from '../../ports/OrderRepository';

export class CreateOrder {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: CreateOrderInput) {
    if (input.items.length === 0) {
      throw new AppError('Order must have at least one item', 422);
    }

    const totalAmount = calculateOrderTotal(input.items);
    return this.orders.create(input, totalAmount);
  }
}

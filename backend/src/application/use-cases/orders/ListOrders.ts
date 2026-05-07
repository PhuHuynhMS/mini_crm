import { ListOrdersFilter, OrderRepository } from '../../ports/OrderRepository';

export class ListOrders {
  constructor(private readonly orders: OrderRepository) {}

  execute(filter: ListOrdersFilter) {
    return this.orders.list(filter);
  }
}

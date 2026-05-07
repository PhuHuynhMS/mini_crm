import { CustomerRepository, ListCustomersFilter } from '../../ports/CustomerRepository';

export class ListCustomers {
  constructor(private readonly customers: CustomerRepository) {}

  execute(filter: ListCustomersFilter) {
    return this.customers.list(filter);
  }
}

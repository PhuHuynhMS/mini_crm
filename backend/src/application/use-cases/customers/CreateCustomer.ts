import { CreateCustomerInput, CustomerRepository } from '../../ports/CustomerRepository';

export class CreateCustomer {
  constructor(private readonly customers: CustomerRepository) {}

  execute(input: CreateCustomerInput) {
    return this.customers.create(input);
  }
}

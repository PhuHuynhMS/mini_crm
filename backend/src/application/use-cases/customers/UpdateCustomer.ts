import { AppError } from '../../../domain/errors/AppError';
import { CustomerRepository, UpdateCustomerInput } from '../../ports/CustomerRepository';

export class UpdateCustomer {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(id: number, input: UpdateCustomerInput) {
    const customer = await this.customers.update(id, input);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }
}

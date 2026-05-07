import { AppError } from '../../../domain/errors/AppError';
import { CustomerRepository } from '../../ports/CustomerRepository';

export class GetCustomerDetail {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(id: number) {
    const customer = await this.customers.findDetailById(id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }
}

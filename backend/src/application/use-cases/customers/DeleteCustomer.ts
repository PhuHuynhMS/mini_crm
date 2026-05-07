import { AppError } from '../../../domain/errors/AppError';
import { CustomerRepository } from '../../ports/CustomerRepository';

export class DeleteCustomer {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(id: number) {
    const deleted = await this.customers.delete(id);

    if (!deleted) {
      throw new AppError('Customer not found', 404);
    }
  }
}

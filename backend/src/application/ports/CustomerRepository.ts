import {
  Customer,
  CustomerDetail,
  CustomerStatus
} from '../../domain/entities/Customer';
import { PaginatedResult } from '../../shared/pagination';

export interface ListCustomersFilter {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: CustomerStatus;
  assignedTo?: number | null;
  notes?: string | null;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface CustomerRepository {
  list(filter: ListCustomersFilter): Promise<PaginatedResult<Customer>>;
  findById(id: number): Promise<Customer | null>;
  findDetailById(id: number): Promise<CustomerDetail | null>;
  create(input: CreateCustomerInput): Promise<Customer>;
  update(id: number, input: UpdateCustomerInput): Promise<Customer | null>;
  delete(id: number): Promise<boolean>;
}

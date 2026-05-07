import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import {
  CreateCustomerInput,
  CustomerRepository,
  ListCustomersFilter,
  UpdateCustomerInput
} from '../../application/ports/CustomerRepository';
import {
  Customer,
  CustomerDetail,
  CustomerStatus,
  RecentCustomerOrder
} from '../../domain/entities/Customer';
import { buildPagination, getPagination, PaginatedResult } from '../../shared/pagination';
import { Database, QueryParams } from '../database/mysqlPool';

interface CustomerRow extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: CustomerStatus;
  assigned_to: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface RecentOrderRow extends RowDataPacket {
  id: number;
  total_amount: number;
  status: string;
  ordered_at: Date;
}

export class MysqlCustomerRepository implements CustomerRepository {
  constructor(private readonly db: Database) {}

  async list(filter: ListCustomersFilter): Promise<PaginatedResult<Customer>> {
    const { page, limit, offset } = getPagination(filter);
    const { whereSql, params } = this.buildListWhere(filter);

    const [countRows] = await this.db.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM customers ${whereSql}`,
      params
    );

    const [rows] = await this.db.query<CustomerRow[]>(
      `SELECT id, name, email, phone, address, status, assigned_to, notes, created_at, updated_at
       FROM customers
       ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = countRows[0]?.total || 0;

    return {
      data: rows.map((row) => this.toDomain(row)),
      pagination: buildPagination(page, limit, total)
    };
  }

  async findById(id: number): Promise<Customer | null> {
    const [rows] = await this.db.query<CustomerRow[]>(
      `SELECT id, name, email, phone, address, status, assigned_to, notes, created_at, updated_at
       FROM customers
       WHERE id = :id
       LIMIT 1`,
      { id }
    );

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findDetailById(id: number): Promise<CustomerDetail | null> {
    const customer = await this.findById(id);

    if (!customer) {
      return null;
    }

    const [orders] = await this.db.query<RecentOrderRow[]>(
      `SELECT id, total_amount, status, ordered_at
       FROM orders
       WHERE customer_id = :id
       ORDER BY ordered_at DESC, id DESC
       LIMIT 5`,
      { id }
    );

    return {
      ...customer,
      recentOrders: orders.map((row): RecentCustomerOrder => ({
        id: row.id,
        totalAmount: row.total_amount,
        status: row.status,
        orderedAt: row.ordered_at
      }))
    };
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO customers (name, email, phone, address, status, assigned_to, notes)
       VALUES (:name, :email, :phone, :address, :status, :assignedTo, :notes)`,
      this.normalizeInput(input)
    );

    const customer = await this.findById(result.insertId);

    if (!customer) {
      throw new Error('Failed to load created customer');
    }

    return customer;
  }

  async update(id: number, input: UpdateCustomerInput): Promise<Customer | null> {
    const fields: string[] = [];
    const params: Record<string, QueryParams> = { id };

    const allowedFields: Array<[keyof UpdateCustomerInput, string]> = [
      ['name', 'name'],
      ['email', 'email'],
      ['phone', 'phone'],
      ['address', 'address'],
      ['status', 'status'],
      ['assignedTo', 'assigned_to'],
      ['notes', 'notes']
    ];

    for (const [inputKey, column] of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(input, inputKey)) {
        fields.push(`${column} = :${inputKey}`);
        params[inputKey] = input[inputKey] ?? null;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const [result] = await this.db.query<ResultSetHeader>(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = :id`,
      params
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM customers WHERE id = :id',
      { id }
    );

    return result.affectedRows > 0;
  }

  private buildListWhere(filter: ListCustomersFilter) {
    const where: string[] = [];
    const params: Record<string, QueryParams> = {};

    if (filter.search) {
      where.push('(name LIKE :search OR email LIKE :search OR phone LIKE :search)');
      params.search = `%${filter.search}%`;
    }

    if (filter.status) {
      where.push('status = :status');
      params.status = filter.status;
    }

    return {
      whereSql: where.length > 0 ? `WHERE ${where.join(' AND ')}` : '',
      params
    };
  }

  private normalizeInput(input: CreateCustomerInput) {
    return {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      status: input.status ?? 'active',
      assignedTo: input.assignedTo ?? null,
      notes: input.notes ?? null
    };
  }

  private toDomain(row: CustomerRow): Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      status: row.status,
      assignedTo: row.assigned_to,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

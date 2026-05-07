import {
  ExecuteValues,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket
} from 'mysql2/promise';
import {
  CreateOrderInput,
  ListOrdersFilter,
  OrderRepository
} from '../../application/ports/OrderRepository';
import { Order, OrderDetail, OrderItem, OrderStatus } from '../../domain/entities/Order';
import { buildPagination, getPagination, PaginatedResult } from '../../shared/pagination';
import { Database, QueryParams } from '../database/mysqlPool';

interface OrderRow extends RowDataPacket {
  id: number;
  customer_id: number;
  customer_name?: string;
  assigned_to: number | null;
  total_amount: number;
  status: OrderStatus;
  notes: string | null;
  ordered_at: Date;
  updated_at: Date;
}

interface OrderItemRow extends RowDataPacket {
  id: number;
  order_id: number;
  product: string;
  quantity: number;
  unit_price: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export class MysqlOrderRepository implements OrderRepository {
  constructor(private readonly db: Database) {}

  async list(filter: ListOrdersFilter): Promise<PaginatedResult<Order>> {
    const { page, limit, offset } = getPagination(filter);
    const { whereSql, params } = this.buildListWhere(filter);

    const [countRows] = await this.db.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM orders o
       ${whereSql}`,
      params
    );

    const [rows] = await this.db.query<OrderRow[]>(
      `SELECT o.id, o.customer_id, c.name AS customer_name, o.assigned_to,
              o.total_amount, o.status, o.notes, o.ordered_at, o.updated_at
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ${whereSql}
       ORDER BY o.ordered_at DESC, o.id DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = countRows[0]?.total || 0;

    return {
      data: rows.map((row) => this.toOrder(row)),
      pagination: buildPagination(page, limit, total)
    };
  }

  async findById(id: number): Promise<Order | null> {
    const [rows] = await this.db.query<OrderRow[]>(
      `SELECT o.id, o.customer_id, c.name AS customer_name, o.assigned_to,
              o.total_amount, o.status, o.notes, o.ordered_at, o.updated_at
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = :id
       LIMIT 1`,
      { id }
    );

    return rows[0] ? this.toOrder(rows[0]) : null;
  }

  async findDetailById(id: number): Promise<OrderDetail | null> {
    const order = await this.findById(id);

    if (!order) {
      return null;
    }

    const [itemRows] = await this.db.query<OrderItemRow[]>(
      `SELECT id, order_id, product, quantity, unit_price
       FROM order_items
       WHERE order_id = :id
       ORDER BY id ASC`,
      { id }
    );

    return {
      ...order,
      items: itemRows.map((row) => this.toOrderItem(row))
    };
  }

  async create(input: CreateOrderInput, totalAmount: number): Promise<OrderDetail> {
    const orderId = await this.db.transaction(async (connection) => {
      const [orderResult] = await this.execute<ResultSetHeader>(
        connection,
        `INSERT INTO orders (customer_id, assigned_to, total_amount, status, notes)
         VALUES (:customerId, :assignedTo, :totalAmount, :status, :notes)`,
        {
          customerId: input.customerId,
          assignedTo: input.assignedTo ?? null,
          totalAmount,
          status: input.status ?? 'new',
          notes: input.notes ?? null
        }
      );

      for (const item of input.items) {
        await this.execute<ResultSetHeader>(
          connection,
          `INSERT INTO order_items (order_id, product, quantity, unit_price)
           VALUES (:orderId, :product, :quantity, :unitPrice)`,
          {
            orderId: orderResult.insertId,
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }
        );
      }

      return orderResult.insertId;
    });

    const order = await this.findDetailById(orderId);

    if (!order) {
      throw new Error('Failed to load created order');
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'UPDATE orders SET status = :status WHERE id = :id',
      { id, status }
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.query<ResultSetHeader>(
      'DELETE FROM orders WHERE id = :id',
      { id }
    );

    return result.affectedRows > 0;
  }

  private buildListWhere(filter: ListOrdersFilter) {
    const where: string[] = [];
    const params: Record<string, QueryParams> = {};

    if (filter.status) {
      where.push('o.status = :status');
      params.status = filter.status;
    }

    if (filter.customerId) {
      where.push('o.customer_id = :customerId');
      params.customerId = filter.customerId;
    }

    return {
      whereSql: where.length > 0 ? `WHERE ${where.join(' AND ')}` : '',
      params
    };
  }

  private async execute<T extends RowDataPacket[] | ResultSetHeader>(
    connection: PoolConnection,
    sql: string,
    params: ExecuteValues
  ) {
    return connection.execute<T>(sql, params);
  }

  private toOrder(row: OrderRow): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      assignedTo: row.assigned_to,
      totalAmount: row.total_amount,
      status: row.status,
      notes: row.notes,
      orderedAt: row.ordered_at,
      updatedAt: row.updated_at
    };
  }

  private toOrderItem(row: OrderItemRow): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      product: row.product,
      quantity: row.quantity,
      unitPrice: row.unit_price
    };
  }
}

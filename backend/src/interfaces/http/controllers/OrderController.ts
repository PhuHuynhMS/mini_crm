import { RequestHandler } from 'express';
import { AppError } from '../../../domain/errors/AppError';
import { CreateOrder } from '../../../application/use-cases/orders/CreateOrder';
import { DeleteOrder } from '../../../application/use-cases/orders/DeleteOrder';
import { GetOrderDetail } from '../../../application/use-cases/orders/GetOrderDetail';
import { ListOrders } from '../../../application/use-cases/orders/ListOrders';
import { UpdateOrderStatus } from '../../../application/use-cases/orders/UpdateOrderStatus';

export class OrderController {
  constructor(
    private readonly listOrders: ListOrders,
    private readonly getOrderDetail: GetOrderDetail,
    private readonly createOrder: CreateOrder,
    private readonly updateOrderStatus: UpdateOrderStatus,
    private readonly deleteOrder: DeleteOrder
  ) {}

  list: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.listOrders.execute({
        status: this.parseStatus(req.query.status),
        customerId: req.query.customer_id ? Number(req.query.customer_id) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      });

      res.json({
        message: 'Orders loaded successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  getOne: RequestHandler = async (req, res, next) => {
    try {
      const order = await this.getOrderDetail.execute(this.parseId(req.params.id));
      res.json({
        message: 'Order loaded successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  create: RequestHandler = async (req, res, next) => {
    try {
      const order = await this.createOrder.execute({
        customerId: req.body.customerId,
        assignedTo: req.body.assignedTo,
        status: req.body.status,
        notes: req.body.notes,
        items: req.body.items
      });

      res.status(201).json({
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus: RequestHandler = async (req, res, next) => {
    try {
      const order = await this.updateOrderStatus.execute(this.parseId(req.params.id), req.body.status);
      res.json({
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  remove: RequestHandler = async (req, res, next) => {
    try {
      await this.deleteOrder.execute(this.parseId(req.params.id));
      res.json({
        message: 'Order deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  private parseId(value: string | string[] | undefined): number {
    if (Array.isArray(value)) {
      throw new AppError('Invalid order id', 400);
    }

    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('Invalid order id', 400);
    }

    return id;
  }

  private parseStatus(value: unknown) {
    return value === 'new' ||
      value === 'processing' ||
      value === 'completed' ||
      value === 'cancelled'
      ? value
      : undefined;
  }
}

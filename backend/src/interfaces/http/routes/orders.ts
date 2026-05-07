import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { db } from '../../../config/db';
import { CreateOrder } from '../../../application/use-cases/orders/CreateOrder';
import { DeleteOrder } from '../../../application/use-cases/orders/DeleteOrder';
import { GetOrderDetail } from '../../../application/use-cases/orders/GetOrderDetail';
import { ListOrders } from '../../../application/use-cases/orders/ListOrders';
import { UpdateOrderStatus } from '../../../application/use-cases/orders/UpdateOrderStatus';
import { MysqlOrderRepository } from '../../../infrastructure/repositories/MysqlOrderRepository';
import { OrderController } from '../controllers/OrderController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const orderRepository = new MysqlOrderRepository(db);
const orderController = new OrderController(
  new ListOrders(orderRepository),
  new GetOrderDetail(orderRepository),
  new CreateOrder(orderRepository),
  new UpdateOrderStatus(orderRepository),
  new DeleteOrder(orderRepository)
);

export const ordersRouter = Router();

const idValidator = param('id').isInt({ min: 1 }).toInt();
const orderStatuses = ['new', 'processing', 'completed', 'cancelled'];

ordersRouter.use(authenticate);

ordersRouter.get(
  '/',
  [
    query('status').optional().isIn(orderStatuses),
    query('customer_id').optional().isInt({ min: 1 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validate,
  orderController.list
);

ordersRouter.get('/:id', [idValidator], validate, orderController.getOne);

ordersRouter.post(
  '/',
  [
    body('customerId').isInt({ min: 1 }).toInt(),
    body('assignedTo').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    body('status').optional().isIn(orderStatuses),
    body('notes').optional({ nullable: true }).trim().isLength({ max: 5000 }),
    body('items').isArray({ min: 1 }),
    body('items.*.product').trim().isLength({ min: 1, max: 200 }),
    body('items.*.quantity').isInt({ min: 1 }).toInt(),
    body('items.*.unitPrice').isFloat({ min: 0 }).toFloat()
  ],
  validate,
  orderController.create
);

ordersRouter.patch(
  '/:id/status',
  [
    idValidator,
    body('status').isIn(orderStatuses)
  ],
  validate,
  orderController.updateStatus
);

ordersRouter.delete('/:id', [idValidator], validate, authorizeAdmin, orderController.remove);

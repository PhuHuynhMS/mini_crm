import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { db } from '../../../config/db';
import { CreateCustomer } from '../../../application/use-cases/customers/CreateCustomer';
import { DeleteCustomer } from '../../../application/use-cases/customers/DeleteCustomer';
import { GetCustomerDetail } from '../../../application/use-cases/customers/GetCustomerDetail';
import { ListCustomers } from '../../../application/use-cases/customers/ListCustomers';
import { UpdateCustomer } from '../../../application/use-cases/customers/UpdateCustomer';
import { MysqlCustomerRepository } from '../../../infrastructure/repositories/MysqlCustomerRepository';
import { CustomerController } from '../controllers/CustomerController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const customerRepository = new MysqlCustomerRepository(db);
const customerController = new CustomerController(
  new ListCustomers(customerRepository),
  new GetCustomerDetail(customerRepository),
  new CreateCustomer(customerRepository),
  new UpdateCustomer(customerRepository),
  new DeleteCustomer(customerRepository)
);

export const customersRouter = Router();

const idValidator = param('id').isInt({ min: 1 }).toInt();
const optionalString = (field: string, max: number) =>
  body(field).optional({ nullable: true }).trim().isLength({ max });

customersRouter.use(authenticate);

customersRouter.get(
  '/',
  [
    query('search').optional().trim().isLength({ min: 1, max: 190 }),
    query('status').optional().isIn(['active', 'inactive']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validate,
  customerController.list
);

customersRouter.get('/:id', [idValidator], validate, customerController.getOne);

customersRouter.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 160 }),
    body('email').optional({ nullable: true }).trim().isEmail().normalizeEmail(),
    optionalString('phone', 40),
    optionalString('address', 255),
    body('status').optional().isIn(['active', 'inactive']),
    body('assignedTo').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    optionalString('notes', 5000)
  ],
  validate,
  customerController.create
);

customersRouter.put(
  '/:id',
  [
    idValidator,
    body('name').optional().trim().isLength({ min: 2, max: 160 }),
    body('email').optional({ nullable: true }).trim().isEmail().normalizeEmail(),
    optionalString('phone', 40),
    optionalString('address', 255),
    body('status').optional().isIn(['active', 'inactive']),
    body('assignedTo').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    optionalString('notes', 5000)
  ],
  validate,
  customerController.update
);

customersRouter.delete('/:id', [idValidator], validate, authorizeAdmin, customerController.remove);

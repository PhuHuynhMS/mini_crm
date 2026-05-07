import { RequestHandler } from 'express';
import { AppError } from '../../../domain/errors/AppError';
import { CreateCustomer } from '../../../application/use-cases/customers/CreateCustomer';
import { DeleteCustomer } from '../../../application/use-cases/customers/DeleteCustomer';
import { GetCustomerDetail } from '../../../application/use-cases/customers/GetCustomerDetail';
import { ListCustomers } from '../../../application/use-cases/customers/ListCustomers';
import { UpdateCustomer } from '../../../application/use-cases/customers/UpdateCustomer';

export class CustomerController {
  constructor(
    private readonly listCustomers: ListCustomers,
    private readonly getCustomerDetail: GetCustomerDetail,
    private readonly createCustomer: CreateCustomer,
    private readonly updateCustomer: UpdateCustomer,
    private readonly deleteCustomer: DeleteCustomer
  ) {}

  list: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.listCustomers.execute({
        search: req.query.search?.toString(),
        status: req.query.status === 'active' || req.query.status === 'inactive'
          ? req.query.status
          : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      });

      res.json({
        message: 'Customers loaded successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  getOne: RequestHandler = async (req, res, next) => {
    try {
      const customer = await this.getCustomerDetail.execute(this.parseId(req.params.id));
      res.json({
        message: 'Customer loaded successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };

  create: RequestHandler = async (req, res, next) => {
    try {
      const customer = await this.createCustomer.execute(req.body);
      res.status(201).json({
        message: 'Customer created successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };

  update: RequestHandler = async (req, res, next) => {
    try {
      const customer = await this.updateCustomer.execute(this.parseId(req.params.id), req.body);
      res.json({
        message: 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  };

  remove: RequestHandler = async (req, res, next) => {
    try {
      await this.deleteCustomer.execute(this.parseId(req.params.id));
      res.json({
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  private parseId(value: string | string[] | undefined): number {
    if (Array.isArray(value)) {
      throw new AppError('Invalid customer id', 400);
    }

    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('Invalid customer id', 400);
    }

    return id;
  }
}

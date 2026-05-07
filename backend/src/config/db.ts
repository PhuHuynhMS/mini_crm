import { env } from './env';
import { createMysqlPool } from '../infrastructure/database/mysqlPool';

export const db = createMysqlPool(env.db);

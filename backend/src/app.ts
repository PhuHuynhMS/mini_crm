import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { db } from './config/db';
import { router } from './interfaces/http/routes';
import {
  errorHandler,
  notFoundHandler
} from './interfaces/http/middlewares/errorHandler';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();

if (require.main === module) {
  const server = app.listen(env.port, () => {
    console.log(`Mini CRM API listening on port ${env.port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

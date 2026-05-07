import mysql from 'mysql2/promise';
import { env } from './env';

const createDatabaseSql = `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci`;

const migrations = [
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY users_email_unique (email),
        KEY users_role_idx (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
  },
  {
    name: 'customers',
    sql: `
      CREATE TABLE IF NOT EXISTS customers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(160) NOT NULL,
        email VARCHAR(190) NULL,
        phone VARCHAR(40) NULL,
        address VARCHAR(255) NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        assigned_to BIGINT UNSIGNED NULL,
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY customers_status_idx (status),
        KEY customers_assigned_to_idx (assigned_to),
        KEY customers_search_idx (name, email, phone),
        CONSTRAINT customers_assigned_to_fk
          FOREIGN KEY (assigned_to) REFERENCES users(id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
  },
  {
    name: 'orders',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        customer_id BIGINT UNSIGNED NOT NULL,
        assigned_to BIGINT UNSIGNED NULL,
        total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        status ENUM('new', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
        notes TEXT NULL,
        ordered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY orders_customer_id_idx (customer_id),
        KEY orders_assigned_to_idx (assigned_to),
        KEY orders_status_idx (status),
        KEY orders_ordered_at_idx (ordered_at),
        CONSTRAINT orders_customer_id_fk
          FOREIGN KEY (customer_id) REFERENCES customers(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,
        CONSTRAINT orders_assigned_to_fk
          FOREIGN KEY (assigned_to) REFERENCES users(id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
  },
  {
    name: 'order_items',
    sql: `
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id BIGINT UNSIGNED NOT NULL,
        product VARCHAR(200) NOT NULL,
        quantity INT UNSIGNED NOT NULL,
        unit_price DECIMAL(15, 2) NOT NULL,
        PRIMARY KEY (id),
        KEY order_items_order_id_idx (order_id),
        CONSTRAINT order_items_order_id_fk
          FOREIGN KEY (order_id) REFERENCES orders(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT order_items_quantity_positive_chk CHECK (quantity > 0),
        CONSTRAINT order_items_unit_price_non_negative_chk CHECK (unit_price >= 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `
  }
];

export const runMigrations = async () => {
  const bootstrapConnection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: false
  });

  try {
    await bootstrapConnection.query(createDatabaseSql);
  } finally {
    await bootstrapConnection.end();
  }

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: false
  });

  try {
    for (const migration of migrations) {
      await connection.query(migration.sql);
      console.log(`Migration applied: ${migration.name}`);
    }
  } finally {
    await connection.end();
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Database migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database migration failed');
      console.error(error);
      process.exit(1);
    });
}

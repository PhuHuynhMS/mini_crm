import mysql, {
  ExecuteValues,
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket
} from 'mysql2/promise';

export type QueryParams = ExecuteValues;
export type DatabaseQueryResult<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]> =
  [T, mysql.FieldPacket[]];

export interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

export interface Database {
  pool: Pool;
  query<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
    sql: string,
    params?: QueryParams
  ): Promise<DatabaseQueryResult<T>>;
  transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export const createMysqlPool = (config: MysqlConfig): Database => {
  const pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit,
    namedPlaceholders: true,
    decimalNumbers: true,
    timezone: 'Z'
  });

  return {
    pool,
    query: (sql, params) => pool.execute(sql, params),
    transaction: async (callback) => {
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    close: () => pool.end()
  };
};

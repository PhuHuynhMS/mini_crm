import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateUserInput, UserRepository } from '../../application/ports/UserRepository';
import { User, UserRole } from '../../domain/entities/User';
import { Database } from '../database/mysqlPool';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export class MysqlUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateUserInput): Promise<User> {
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO users (name, email, password, role)
       VALUES (:name, :email, :password, :role)`,
      {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role
      }
    );

    const user = await this.findById(result.insertId);

    if (!user) {
      throw new Error('Failed to load created user');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.db.query<UserRow[]>(
      `SELECT id, name, email, password, role, created_at, updated_at
       FROM users
       WHERE email = :email
       LIMIT 1`,
      { email }
    );

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await this.db.query<UserRow[]>(
      `SELECT id, name, email, password, role, created_at, updated_at
       FROM users
       WHERE id = :id
       LIMIT 1`,
      { id }
    );

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  private toDomain(row: UserRow): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

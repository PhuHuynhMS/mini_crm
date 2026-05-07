import { AppError } from '../../../domain/errors/AppError';
import { PublicUser, UserRole, toPublicUser } from '../../../domain/entities/User';
import { PasswordHasher } from '../../ports/PasswordHasher';
import { TokenService } from '../../ports/TokenService';
import { UserRepository } from '../../ports/UserRepository';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existingUser = await this.users.findByEmail(input.email);

    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      ...input,
      email: input.email.toLowerCase(),
      password: passwordHash
    });

    return {
      user: toPublicUser(user),
      token: this.tokenService.sign({ sub: String(user.id), role: user.role })
    };
  }
}

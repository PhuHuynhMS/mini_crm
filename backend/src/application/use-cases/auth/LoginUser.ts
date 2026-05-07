import { AppError } from '../../../domain/errors/AppError';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';
import { PasswordHasher } from '../../ports/PasswordHasher';
import { TokenService } from '../../ports/TokenService';
import { UserRepository } from '../../ports/UserRepository';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: PublicUser;
  token: string;
}

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email.toLowerCase());

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.password);

    if (!passwordMatches) {
      throw new AppError('Invalid email or password', 401);
    }

    return {
      user: toPublicUser(user),
      token: this.tokenService.sign({ sub: String(user.id), role: user.role })
    };
  }
}

import { AppError } from '../../../domain/errors/AppError';
import { PublicUser, toPublicUser } from '../../../domain/entities/User';
import { UserRepository } from '../../ports/UserRepository';

export class GetProfile {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: number): Promise<PublicUser> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return toPublicUser(user);
  }
}

import { UsersRepository } from "../repository/UserRepository";

export class UserService {
  private userRepo: UsersRepository;

  constructor(userRepo: UsersRepository) {
    this.userRepo = userRepo;
  }

  getUserIdCountry = async (email: string) => {
    const { username: userId, country } = await this.userRepo.selectUsernameCountryByEmail(email);
    return {
      userId,
      country,
    };
  };

  getUser = async (email: string) => {
    const result = await this.userRepo.selectUserByEmail(email);
    return {
      ...result,
      userId: result.username,
    };
  };
}

import { DBUserUpdate, UserUpdateSchema } from "../db/schema";
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

  updateUser = async (userId: number, data: DBUserUpdate) => {
    const parsedData = UserUpdateSchema.parse(data);
    const result = await this.userRepo.updateUser(userId, parsedData);
    return result;
  };
}

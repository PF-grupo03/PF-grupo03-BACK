import { Injectable } from '@nestjs/common';
import { UsersRepository } from './user.repository';
import { CreateUserDto, FiltersUsersDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getUsers(params?: FiltersUsersDto) {
    return this.usersRepository.getUsers(params);
  }

  getUserById(id: string) {
    return this.usersRepository.getUserById(id);
  }

  addUser(user: CreateUserDto) {
    return this.usersRepository.addUser(user);
  }

  updateUser(id: string, userBody: UpdateUserDto) {
    return this.usersRepository.updateUser(id, userBody);
  }

  deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }

  getUserByEmail(email: string) {
    return this.usersRepository.getUserByEmail(email);
  }

  async makeAdmin(id: string) {
    return this.usersRepository.makeAdmin(id);
  }
}

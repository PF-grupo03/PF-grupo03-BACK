import { Injectable } from '@nestjs/common';
import { UsersRepository } from './user.repository';
import {
  bannedUserDto,
  CreateUserDto,
  FiltersUsersDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './user.dto';

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

  updateImageProfile(id: string, file: Express.Multer.File) {
    return this.usersRepository.updateImageProfile(id, file);
  }

  deleteProfileImage(id: string, file: Express.Multer.File) {
    return this.usersRepository.deleteProfileImage(id, file);
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

  async removeAdmin(id: string) {
    return this.usersRepository.removeAdmin(id);
  }

  async banUser(bannedUserDto: bannedUserDto, id: string) {
    return this.usersRepository.banUser(bannedUserDto, id);
  }

  async unbanUser(id: string) {
    return this.usersRepository.unbanUser(id);
  }

  async changePassword(id: string, newPassword: UpdateUserPasswordDto) {
    return this.usersRepository.changePassword(id, newPassword);
  }
}

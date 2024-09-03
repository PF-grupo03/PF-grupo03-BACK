import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, FiltersUsersDto, UpdateUserDto, bannedUserDto } from './user.dto';
import { MailRepository } from 'src/mail/mail.repository';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly mailRepository: MailRepository
  ) {}

  async getUsers(params?: FiltersUsersDto) {
    const { limit, page, name, email } = params;
    try {
      return await this.usersRepository.find({
        where: {
          name: name || undefined,
          email: email || undefined,
          isActive: true,
        },
        take: limit || undefined,
        skip: page || undefined,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error obteniendo usuarios');
    }
  }

  async getUserById(id: string) {
    try {
      const userById = await this.usersRepository.findOne({
        where: { id, isActive: true },
      });
      if (!userById) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }

      const { password, isAdmin, ...userNoPassword } = userById;
            return userNoPassword;
      
    } catch (error) {
      throw new InternalServerErrorException('Error obteniendo usuarios');
    }
  }

  async updateUser(id: string, userBody: UpdateUserDto) {
    try {
      const result = await this.usersRepository.update(id, userBody);
      if (result.affected === 0) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

      const userById = await this.usersRepository.findOne({
        where: { id, isActive: true },
      });

      const { password, isAdmin, ...userNoPassword} = userById
      return {
        message: 'Usuario actualizado correctamente',
        userNoPassword,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Propaga el error NotFoundException
    }
      throw new InternalServerErrorException('Error obteniendo usuarios');
    }
  }

  async deleteUser(id: string) {
    try {
      const userById = await this.usersRepository.findOne({
        where: { id, isActive: true },
      });
      if (!userById) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      userById.isActive = false;
      await this.usersRepository.save(userById);
      return {
        message: 'Usuario eliminado correctamente',
      };
    } catch (error) {
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error; // Propaga el error NotFoundException
        }
        throw new InternalServerErrorException('Error al eliminar el usuario: ' + error.message);
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    try {

      const userByEmail = await this.usersRepository.findOneBy({ email });

      if (!userByEmail) throw new NotFoundException('Usuario no encontrado');

      return userByEmail;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el usuario por email: ' + error.message);
    }
  }

  async addUser(user: CreateUserDto): Promise<Partial<UserEntity>> {
    try {
      const existingUser = await this.usersRepository.findOneBy({
        email: user.email,
      });
      if (existingUser) {
        throw new BadRequestException('El usuario con este email ya existe');
      }

      const newUser = await this.usersRepository.save(user);

      const dbUser = await this.usersRepository.findOneBy({ id: newUser.id });
      if (!dbUser)
        throw new InternalServerErrorException(
          `Error al recuperar el usuario recién creado con id ${newUser.id}`,
        );

      const { password, isAdmin, ...userNoPassword } = dbUser;
      return userNoPassword;

    } catch (error) {
      throw new BadRequestException(
        'Error al agregar el usuario: ' + error.message,
      );
    }
  }

  async makeAdmin(id: string) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      user.isAdmin = true;
      await this.usersRepository.save(user);

      const { password, isAdmin, ...userNoPassword} = user;

      return {
        message: 'Usuario actualizado correctamente',
        userNoPassword,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error actualizando el usuario');
    }
  }

  async banUser(userbanned: bannedUserDto, id: string) {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      user.isBanned = true;
      await this.usersRepository.save(user);
      this.mailRepository.userSuspensionEmail(userbanned)
      return {
        message: 'Usuario baneado correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error baneando el usuario');
    }
}
}
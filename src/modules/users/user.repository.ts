import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  FiltersUsersDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  bannedUserDto,
} from './user.dto';
import { MailRepository } from 'src/mail/mail.repository';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { DEFAULT_PROFILE_IMAGE_USER } from 'src/config/env.config';

@Injectable()
export class UsersRepository {
  private saltRounds = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly mailRepository: MailRepository,
    
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
      if (result.affected === 0)
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);

      const userById = await this.usersRepository.findOne({
        where: { id, isActive: true },
      });

      const { password, isAdmin, ...userNoPassword } = userById;
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

  async updateImageProfile(id: string, file: Express.Multer.File) {
    try {
      const userById = await this.usersRepository.findOne({
        where: { id, isActive: true },
      });
      if (!userById)
        throw new BadRequestException(
          'No existe el usuario con el ID brindado',
        );
      const response = async (): Promise<UploadApiResponse> => {
        return new Promise((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'travel_zone_cloudinary' },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            },
          );
          toStream(file.buffer).pipe(upload);
        });
      };

      const imageResult = await response();
      userById.imageProfile = imageResult.secure_url || DEFAULT_PROFILE_IMAGE_USER;
      await this.usersRepository.save(userById);
      return {
        message: 'Foto de perfil actualizada',
        userById,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error actualizando imagen de usuario',
      );
    }
  }

  async deleteProfileImage(id: string) {
    try {
      const userById = await this.usersRepository.findOne({
        where: { id, isActive: true },
      });
      if (!userById)
        throw new BadRequestException(
          'No existe el usuario con el ID brindado',
        );

      const imageProfileUser = userById.imageProfile;

      if (imageProfileUser && imageProfileUser.includes('res.cloudinary.com')) {
        const publicId = imageProfileUser
          .split('/')
          .slice(-2)
          .join('/')
          .split('.')[0];
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (destroyError) {
            console.log(destroyError);
            throw new InternalServerErrorException(
              'Error en Cloudinary para eliminar imagen de usuario',
            );
          }
        }
      }
      userById.imageProfile = DEFAULT_PROFILE_IMAGE_USER;
      await this.usersRepository.save(userById);
      return 'Imagen de usuario eliminada correctamente';
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error eliminando imagen de usuario',
      );
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

      if (userById.imageProfile && userById.imageProfile.includes("res.cloudinary.com") && userById.imageProfile !== DEFAULT_PROFILE_IMAGE_USER) {
        const publicId = userById.imageProfile.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      userById.isActive = false;
      await this.usersRepository.save(userById);
      return {
        message: 'Usuario eliminado correctamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar el usuario: ' + error.message,
      );
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    try {
      console.log(email);
      
      const userByEmail = await this.usersRepository.findOne({
        where: { email, isActive: true }
      });
      console.log(userByEmail);
      

      if (!userByEmail) throw new NotFoundException('Usuario no encontrado');

      return userByEmail;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el usuario por email: ' + error.message,
      );
    }
  }

  async getUserByEmailGoogle(email: string): Promise<UserEntity> {
    try {
      console.log(email);
      
      const userByEmail = await this.usersRepository.findOne({
        where: { email, isActive: true }
      });
      console.log(userByEmail);
      


      return userByEmail;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el usuario por email: ' + error.message,
      );
    }
  }
  async addUser(
    user: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<Partial<UserEntity>> {
    try {
      const existingUser = await this.usersRepository.findOneBy({
        email: user.email,
      });
      if (existingUser) {
        throw new BadRequestException('El usuario con este email ya existe');
      }

      const newUser = await this.usersRepository.save(user);

      if (file) {
        const response = async (): Promise<UploadApiResponse> => {
          return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
              { resource_type: 'auto', folder: 'travel_zone_cloudinary' },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              },
            );
            toStream(file.buffer).pipe(upload);
          });
        };

        const imageResult = await response();
        newUser.imageProfile = imageResult.secure_url;
        await this.usersRepository.save(newUser);
      }

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

      const { password, isAdmin, ...userNoPassword } = user;

      return {
        message: 'Usuario asignado el rol de administrador correctamente',
        userNoPassword,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error actualizando el usuario');
    }
  }

  async removeAdmin(id: string) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      user.isAdmin = false;
      await this.usersRepository.save(user);
      return { message: 'Rol de administrador removido correctamente' };
    } catch (error) {
      throw new InternalServerErrorException('Error actualizando el usuario');
    }
  }

  async banUser(userbanned: bannedUserDto, id: string) {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        console.log('No se encontro el usuario');
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }

      user.isBanned = true;
      await this.usersRepository.save(user);

      const updatedUser: UpdateUserDto = {
        imageProfile: user.imageProfile,
        username: user.username,
        name: user.name,
        email: user.email,
        password: '',
        dni: user.dni,
        phone: user.phone,
        isActive: user.isActive,
        isBanned: user.isBanned,
      };

      this.mailRepository.userSuspensionEmail(updatedUser, userbanned);

      return {
        message: 'Usuario baneado correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error baneando el usuario');
    }
  }

  async unbanUser(id: string) {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      user.isBanned = false;
      await this.usersRepository.save(user);
      return {
        message: 'Usuario desbaneado correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error desbaneando el usuario');
    }
  }

  async changePassword(id: string, newPassword: UpdateUserPasswordDto) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }

      if (!newPassword.password) {
        throw new BadRequestException('Debe proporcionar una nueva contraseña');
      }

      user.password = await bcrypt.hash(newPassword.password, 10);
      await this.usersRepository.save(user);

      return {
        message: 'Contraseña cambiada correctamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error cambiando la contraseña');
    }
  }

  async createUserGoogle(userGoogle: any): Promise<UserEntity> {
    try {
      const { email, firstName, lastName, profileImage } = userGoogle;

      
      let imageProfileUrl = DEFAULT_PROFILE_IMAGE_USER;  

      if (profileImage) {
        try {
          
          const response = await fetch(profileImage);
          if (!response.ok) {
            throw new BadRequestException('No se pudo descargar la imagen de perfil.');
          }

          
          const imageBuffer = Buffer.from(await response.arrayBuffer());

          
          const uploadImageToCloudinary = (): Promise<UploadApiResponse> => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'travel_zone_cloudinary' },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );
              toStream(imageBuffer).pipe(uploadStream);
            });
          };

          const uploadResult = await uploadImageToCloudinary();
          imageProfileUrl = uploadResult.secure_url;
        } catch (uploadError) {
          console.error('Error al procesar la imagen:', uploadError);
          imageProfileUrl = DEFAULT_PROFILE_IMAGE_USER;
        }
      }

      
      const plainPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, this.saltRounds);

      
      const newUser = new UserEntity();
      newUser.email = email;
      newUser.name = `${firstName} ${lastName}`;
      newUser.username = `${firstName}`;
      newUser.dni = this.generateRandomDNI();
      newUser.phone = this.generateRandomPhone();
      newUser.password = hashedPassword;
      newUser.imageProfile = imageProfileUrl;

      const savedUser = await this.usersRepository.save(newUser);
      return savedUser;
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  private generateRandomDNI(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }

  private generateRandomPhone(): number {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

}

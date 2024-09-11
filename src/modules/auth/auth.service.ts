import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/user.dto';
import { UsersRepository } from '../users/user.repository';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService

    ) {}

    getAuth(): string {
        return "Autenticación...";
    }

    // async findUserByEmail(email: string) {
    //     const userDb= this.usersRepository.getUserByEmail(email);
    //     return userDb;
    // }

    async findUserByEmail(email: string) {
        try {
            // Buscar el usuario por email en la base de datos
            const userDb = await this.usersRepository.getUserByEmail(email);
    
            return userDb;
    
        } catch (error) {
            // Manejar errores y lanzar excepciones adecuadas
            console.error('Error al buscar el usuario por email:', error);
            throw new InternalServerErrorException('Error al buscar el usuario');
        }
    }
    
    // async generateJwt(user: any) {
    //     const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    //     return this.jwtService.sign(payload);
    // }

    async generateJwt(user: any) {
        try {
            // Crear el payload para el JWT
            const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    
            // Firmar el payload para generar el JWT
            const token = this.jwtService.sign(payload);
    
            return token;
            
        } catch (error) {
            // Manejar errores y lanzar excepciones adecuadas
            console.error('Error al generar el JWT:', error);
            throw new InternalServerErrorException('Error al generar el token de autenticación');
        }
    }
    

    // async signIn(email: string, password: string) {

    //     const user = await this.usersRepository.getUserByEmail(email);

    //     if(!user) throw new BadRequestException('Credenciales incorrectas');

    //     const validPassword = await bcrypt.compare(password, user.password);
    //     if(!validPassword) throw new BadRequestException('Credenciales Invalidas');

    //     const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    //     const token = this.jwtService.sign(payload);

    //     return {
    //         message: ' Usuario Logueado...',
    //         token,
    //         user
    //     };

    // }

    async signIn(email: string, password: string) {
        try {
            // Intentar obtener el usuario por correo electrónico
            const user = await this.usersRepository.getUserByEmail(email);
    
            // Verificar si el usuario no existe
            if (!user) {
                throw new BadRequestException('Credenciales incorrectas');
            }
    
            // Verificar si la contraseña es válida
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new BadRequestException('Credenciales inválidas');
            }
    
            // Crear el payload y generar el token JWT
            const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
            const token = this.jwtService.sign(payload);
    
            // Devolver la respuesta con el token y el usuario
            return {
                message: 'Usuario logueado...',
                token,
                user
            };
    
        } catch (error) {
            // Manejar errores y lanzarlos como excepciones
            console.error('Error en el inicio de sesión:', error);
            if (error instanceof BadRequestException) {
                throw error; // Re-lanzar la excepción BadRequestException para manejarla en el controlador
            } else {
                throw new InternalServerErrorException('Error en el servidor al intentar iniciar sesión');
            }
        }
    }
    
    // async signUp(user: CreateUserDto, file?: Express.Multer.File) {
    //     const { password } = user;

    //     //* Hashear la contraseña
    //     const hashedPassword = await bcrypt.hash(password, 10);
        
    //     //* Crear usuario en BBDD:
    //     const newUser = await this.usersRepository.addUser({
    //         ...user,
    //         password: hashedPassword,
    //     })

    //     await this.mailService.sendWelcomeEmail(user);

    //             return {
    //         message: 'Usuario registrado exitosamente',
    //         user: newUser
    //     };
    // }

    async signUp(user: CreateUserDto, file?: Express.Multer.File) {
        try {
            const { password } = user;
    
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Crear usuario en la base de datos
            const newUser = await this.usersRepository.addUser({
                ...user,
                password: hashedPassword,
            });
    
            // Enviar correo de bienvenida
            await this.mailService.sendWelcomeEmail(user);
    
            // Devolver respuesta exitosa
            return {
                message: 'Usuario registrado exitosamente',
                user: newUser
            };
    
        } catch (error) {
            // Manejar errores y lanzar excepciones adecuadas
            console.error('Error en el registro del usuario:', error);
            if (error instanceof BadRequestException) {
                throw error; // Re-lanzar la excepción BadRequestException para manejarla en el controlador
            } else if (error instanceof InternalServerErrorException) {
                throw error; // Re-lanzar InternalServerErrorException para errores del servidor
            } else {
                throw new InternalServerErrorException('Error en el servidor al intentar registrar el usuario');
            }
        }
    }
    
}

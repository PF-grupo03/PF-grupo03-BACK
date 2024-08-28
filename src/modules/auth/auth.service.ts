import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/user.dto';
import { UsersRepository } from '../users/user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from '../mailer/mail.service';


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

    async findUserByEmail(email: string) {
        const userDb= this.usersRepository.getUserByEmail(email);  
        
        return userDb;
    }

    async generateJwt(user: any) {
        const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
        return this.jwtService.sign(payload);
    }

    async signIn(email: string, password: string) {
        
        
        const user = await this.usersRepository.getUserByEmail(email);
        
        
        if(!user) throw new BadRequestException('Credenciales incorrectas');

        
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword) throw new BadRequestException('Credenciales Invalidas');
        
        
        const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
        const token = this.jwtService.sign(payload);
        
        
        return {
            message: ' Usuario Logueado...',
            token,
        };

    }

    async signUp(user: CreateUserDto) {
        const { email, password } = user;

        //* Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        //* Crear usuario en BBDD:
        const newUser = await this.usersRepository.addUser({
            ...user,
            password: hashedPassword
        })

        this.mailService.sendWelcomeEmail(user.name, user.email);

                return {
            message: 'Usuario registrado exitosamente',
            user: newUser
        };
    }

}

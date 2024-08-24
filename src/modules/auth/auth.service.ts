import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/user.dto';
import { UsersRepository } from '../users/user.repository';

@Injectable()
export class AuthService {
    constructor (
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService

    ) {}

    getAuth(): string {
        return "Autenticación...";
    }

    async findUserByEmail(email: string) {
        // Implementa la lógica para encontrar un usuario por su email
        return this.usersRepository.getUserByEmail(email);
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
        
        
        const payload = { id: user.id, email: user.email, isAdmin: user.IsAdmin};
        const token = this.jwtService.sign(payload);
        
        
        return {
            message: ' Usuario Logueado...',
            token,
        };

    }

    async signUp(user: CreateUserDto) {
        const { email, password } = user;
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.usersRepository.addUser({
            ...user,
            password: hashedPassword
        })

        return {
            message: 'Usuario registrado exitosamente',
            user: newUser,
        };
    

    }

}

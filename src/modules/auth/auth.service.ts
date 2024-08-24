import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/user.dto';
import { UsersRepository } from '../users/user.repository';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
    constructor (
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly authRepository: AuthRepository

    ) {}

    getAuth(): string {
        return "Autenticación...";
    }

    async findUserByEmail(email: string) {
        return this.usersRepository.getUserByEmail(email);
    }

    async generateJwt(user: any) {
        const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
        return this.jwtService.sign(payload);
    }

    async signIn(email: string, password: string) {
    return this.authRepository.signIn(email, password);
    }

    async signUp(user: CreateUserDto) {
        return this.authRepository.signUp(user);
    }

}

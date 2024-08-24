import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { UsersRepository } from "../users/user.repository";
import { JwtService } from "@nestjs/jwt/dist/jwt.service";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "../users/user.dto";


@Injectable()
export class AuthRepository {

    constructor( private readonly usersRepository: UsersRepository, private readonly jwtService: JwtService) {}

    async signIn(email: string, password: string) {
        try {
            const user = await this.usersRepository.getUserByEmail(email);
            if (!user) {
                throw new BadRequestException('Credenciales incorrectas');
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new BadRequestException('Credenciales inválidas');
            }

            const payload = { id: user.id, email: user.email, isAdmin: user.IsAdmin };
            const token = this.jwtService.sign(payload);

            return {
                message: 'Usuario logueado con válido',
                token,
            };
        } catch (error) {
            console.error('Error en signIn:', error);
            throw new InternalServerErrorException('Error en el servidor');
        }
};

    async signUp(user: CreateUserDto) {
        try {
        const createdUser = await this.usersRepository.addUser(user);
        return createdUser;
        } catch (error) {
            console.error('Error en signUp:', error);
            throw new InternalServerErrorException('Error en el servidor');
            }
}
}
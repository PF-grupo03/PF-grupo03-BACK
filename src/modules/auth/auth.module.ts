import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { UsersRepository } from '../users/user.repository';
import { GoogleStrategy } from './google.strategy';
import { MailModule } from '../../mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/config/env.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MailModule,
    PassportModule, // Asegúrate de registrar PassportModule
    JwtModule.register({
      secret: JWT_SECRET, // Cambia esto por tu secreto real
      signOptions: { expiresIn: '60m' }, // Ajusta el tiempo de expiración según sea necesario
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, GoogleStrategy],
})
export class AuthModule {}

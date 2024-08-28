import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { UsersRepository } from '../users/user.repository';
import { GoogleStrategy } from './google.strategy';
import { MailService } from '../mailer/mail.service';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MailService],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, GoogleStrategy, GoogleStrategy]
})
export class AuthModule {}

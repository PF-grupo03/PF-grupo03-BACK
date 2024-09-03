import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { UsersRepository } from '../users/user.repository';
import { GoogleStrategy } from './google.strategy';
import { MailModule } from '../../mail/mail.module';
import { MailRepository } from 'src/mail/mail.repository';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MailModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, GoogleStrategy, GoogleStrategy],
})
export class AuthModule {}

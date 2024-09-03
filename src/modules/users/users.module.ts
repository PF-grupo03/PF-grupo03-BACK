import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { MailModule } from 'src/mail/mail.module';
import { MailRepository } from 'src/mail/mail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MailModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, MailModule, MailRepository],
})
export class UsersModule {}

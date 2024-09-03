import { MailerModule, MailerService} from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailRepository } from './mail.repository';
import { MailService } from './mail.service';

@Module({
    exports: [MailService, MailRepository],
    imports: [
    MailerModule.forRootAsync({
        useFactory: async (config: ConfigService) => ({
            transport: {
                host: config.get('MAIL_HOST'),
                secure: false,
                auth: {
                    user: config.get('MAIL_USER'),
                    pass: config.get('MAIL_PASSWORD'),
                },
            },
            defaults: {
                from: `"No reply", <${config.get('MAIL_FROM')}>`,
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        inject: [ConfigService],
        })
    ],
    providers: [MailRepository, MailService],
})
export class MailModule {}

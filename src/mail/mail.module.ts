// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { Module } from '@nestjs/common';
// import { MailService } from './mail.service';
// import { join } from 'path';
// import { MAIL_PASSWORD, MAIL_USER } from 'src/config/env.config';

// @Module({
//   imports: [
//     MailerModule.forRoot({
//       // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
//       // or
//       transport: {
//         host: 'smtp.example.com',
//         secure: false,
//         auth: {
//           user: MAIL_USER,
//           pass: MAIL_PASSWORD,
//         },
//       },
//       defaults: {
//         from: '"No Reply" <noreply@example.com>',
//       },
//       template: {
//         dir: join(__dirname, 'templates'),
//         adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
//         options: {
//           strict: true,
//         },
//       },
//     }),
//   ],
//   providers: [MailService],
//   exports: [MailService], // 👈 export for DI
// })
// export class MailModule {}

// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { Global, Module } from '@nestjs/common';
// import { MailService } from './mail.service';
// import { join } from 'path';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Global()
// @Module({
//   imports: [
//     MailerModule.forRootAsync({
//       imports: [ConfigModule], // import module if not enabled globally
//       useFactory: async (config: ConfigService) => ({
//         // transport: config.get("MAIL_TRANSPORT"),
//         // or
//         transport: {
//           host: config.get('MAIL_HOST'),
//           secure: false,
//           auth: {
//             user: config.get('MAIL_USER'),
//             pass: config.get('MAIL_PASSWORD'),
//           },
//         },
//         defaults: {
//           from: `"No Reply" <${config.get('MAIL_FROM')}>`,
//         },
//         template: {
//           dir: join(__dirname, 'templates'),
//           adapter: new HandlebarsAdapter(),
//           options: {
//             strict: true,
//           },
//         },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [MailService],
//   exports: [MailService],
// })
// export class MailModule {}

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Importar ConfigModule si no se ha habilitado globalmente
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST') || 'smtp.gmail.com',
          port: 587, // Puerto estándar para TLS
          secure: false, // Usar TLS
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
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
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

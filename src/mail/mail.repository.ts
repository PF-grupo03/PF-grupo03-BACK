import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { bannedUserDto, CreateUserDto, UpdateUserDto } from "../modules/users/user.dto";
import path from "path";
import fs from 'fs';
import { existsSync } from 'fs';
import { mailerConfig } from "src/config/mail.config";

@Injectable()
export class MailRepository {
    constructor(private mailerService: MailerService) {}

    async sendWelcomeEmail(user: CreateUserDto) {

        const emailTemplatePath = path.resolve(__dirname, 'template', 'emailRegistro.template.html');

        if (!existsSync(emailTemplatePath)) {
            console.error(`El archivo de plantilla no existe: ${emailTemplatePath}`);
            throw new Error('Archivo de plantilla no encontrado');
        }

        let emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');

        emailHtml = emailHtml.replace(/\[name\]/g, user.name);
        emailHtml = emailHtml.replace(/\[name\]/g, user.name);
        emailHtml = emailHtml.replace(/\[email\]/g, user.email);

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: '¡Bienvenido a Travel Zone!',
            html: emailHtml
        };

        mailerConfig.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
            } else {
                console.log('Email enviado correctamente: ' + info.response);
            }
        });
        return user;
    }

    async userSuspensionEmail(user: UpdateUserDto, userbanned: bannedUserDto) {

        const emailTemplatePath = path.resolve(__dirname, 'template', 'emailBaneo.template.html');

        if (!existsSync(emailTemplatePath)) {
            console.error(`El archivo de plantilla no existe: ${emailTemplatePath}`);
            throw new Error('Archivo de plantilla no encontrado');
        }

        let emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');
        emailHtml = emailHtml.replace(/\[name\]/g, user.name);
        emailHtml = emailHtml.replace(/\[motive\]/g, userbanned.motive);
        emailHtml = emailHtml.replace(/\[email\]/g, user.email);

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Cuenta suspendida en Travel Zone',
            html: emailHtml
        };

        mailerConfig.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
            } else {
                console.log('Email de suspensión enviado correctamente: ' + info.response);
            }
        });

        return userbanned;
    }
}
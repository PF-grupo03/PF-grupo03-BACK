import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { template } from "handlebars";
import { Subject } from "rxjs";
import { CreateUserDto } from "../users/user.dto";
import path from "path";
import fs from 'fs';
import nodemailer from 'nodemailer';

@Injectable()
export class MailRepository {
    constructor(private mailerService: MailerService) {}

/*     async sendEmail (user: string, email: string) {
        const url = "url del deploy de front"
        await this.mailService.sendMail({
            to:email,
            Subject: 'Gracias por registrarte en Travel Zone',
            template: 'emailRegistro',
            context: {
                name: user,
                url
            }
        })
    } */

    async sendWelcomeEmail(user: CreateUserDto) {
        // Cargar el archivo HTML
        const emailTemplatePath = path.join(__dirname, 'emailRegistro.Template.html');
        let emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');

        // Reemplazar los placeholders con los datos reales del usuario
        emailHtml = emailHtml.replace(/\[name\]/g, user.name);
        emailHtml = emailHtml.replace(/\[email\]/g, user.email);

        // Configurar el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        // Opciones del email
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: '¡Bienvenido a Travel Zone!',
            html: emailHtml
        };

        // Enviar el email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
            } else {
                console.log('Email enviado correctamente: ' + info.response);
            }
        });
    }


}

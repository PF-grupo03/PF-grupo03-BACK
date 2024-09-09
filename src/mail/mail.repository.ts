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
                console.log('Email de bienvenida enviado correctamente: ' + info.response);
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

        if (!user)
            throw new Error('Usuario no encontrado');

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

    async sendOrderConfirmationEmail(order, user: UpdateUserDto) {
        const emailTemplatePath = path.resolve(__dirname, 'template', 'emailCompra.template.html');

        if (!existsSync(emailTemplatePath)) {
            console.error(`El archivo de plantilla no existe: ${emailTemplatePath}`);
            throw new Error('Archivo de plantilla no encontrado');
        }

        let emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');

        emailHtml = emailHtml.replace(/\[email\]/g, user.email);
        emailHtml = emailHtml.replace(/\[nombre\]/g, user.name);
        emailHtml = emailHtml.replace(/\[orderNumber\]/g, order.id);
        emailHtml = emailHtml.replace(/\[purchaseDate\]/g, order.orderDate.toISOString().split('T')[0]);
        emailHtml = emailHtml.replace(/\[destination\]/g, order.orderDetails[0].product.destination || 'N/A');
        emailHtml = emailHtml.replace(/\[flightDate\]/g, order.orderDetails[0].product.startDate || 'N/A');

        const passengerListHtml = order.passengers
            .map(passenger => `
                <li>
                    <strong>Nombre:</strong> ${passenger.name}<br>
                    <strong>Email:</strong> ${passenger.email}<br>
                    <strong>Teléfono:</strong> ${passenger.cellphone}<br>
                    <strong>DNI:</strong> ${passenger.dni}
                </li>`)
            .join('');
        emailHtml = emailHtml.replace(/\[passengerList\]/g, passengerListHtml);

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Confirmacion de compra en Travel Zone',
            html: emailHtml
        };

        mailerConfig.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo de compra:', error);
            } else {
                console.log('Email de confirmación de compra enviado correctamente: ' + info.response);
            }
        });
    }


}
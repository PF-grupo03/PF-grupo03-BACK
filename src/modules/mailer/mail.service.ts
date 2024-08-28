import { Injectable } from "@nestjs/common";
import { MailRepository } from "./mail.repository";

@Injectable()
export class MailService {
    constructor(private mailRepository: MailRepository) {}

    sendWelcomeEmail(user: string, email: string) {
        return `Email sent to ${user} with email ${email}`;
    }
}
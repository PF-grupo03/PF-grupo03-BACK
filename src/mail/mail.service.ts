import { Injectable } from "@nestjs/common";
import { MailRepository } from "./mail.repository";
import { CreateUserDto, mailUserDto } from "../modules/users/user.dto";

@Injectable()
export class MailService {
    constructor(private mailRepository: MailRepository) {}

    sendWelcomeEmail(user: CreateUserDto): Promise<Partial<CreateUserDto>> {
        return this.mailRepository.sendWelcomeEmail(user);
    }
}

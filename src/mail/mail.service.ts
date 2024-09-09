import { Injectable } from "@nestjs/common";
import { MailRepository } from "./mail.repository";
import { bannedUserDto, CreateUserDto, UpdateUserDto,} from "../modules/users/user.dto";

@Injectable()
export class MailService {
    constructor(private mailRepository: MailRepository) {}

    sendWelcomeEmail(user: CreateUserDto): Promise<Partial<CreateUserDto>> {
        return this.mailRepository.sendWelcomeEmail(user);
    }

    userSuspensionEmail(user: UpdateUserDto, userbanned: bannedUserDto): Promise<Partial<bannedUserDto>> {
        return this.mailRepository.userSuspensionEmail(user, userbanned);
    }

    sendOrderConfirmationEmail(order, user: UpdateUserDto) {
        return this.mailRepository.sendOrderConfirmationEmail(order, user);
    }
}

import { Injectable } from "@nestjs/common";
import { MailRepository } from "./mail.repository";
import { bannedUserDto, CreateUserDto,} from "../modules/users/user.dto";

@Injectable()
export class MailService {
    constructor(private mailRepository: MailRepository) {}

    sendWelcomeEmail(user: CreateUserDto): Promise<Partial<CreateUserDto>> {
        return this.mailRepository.sendWelcomeEmail(user);
    }

    userSuspensionEmail(userbanned: bannedUserDto): Promise<Partial<bannedUserDto>> {
        return this.mailRepository.userSuspensionEmail(userbanned);
    }
}

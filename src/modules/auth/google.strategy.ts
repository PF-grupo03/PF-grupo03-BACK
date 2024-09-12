import { Injectable } from "@nestjs/common";
import { PassportStrategy} from '@nestjs/passport';
import {Strategy, VerifyCallback} from 'passport-google-oauth20';
import { GOOGLE_CLIENT_ID, GOOGLE_SECRET } from "src/config/env.config";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/user.dto";
import { UserEntity } from "../users/user.entity";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(private readonly authService: AuthService) {
        super({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_SECRET,
            callbackURL: 'https://pf-grupo03-back.onrender.com/auth/google/callback',
            scope: ['email', 'profile']
        })
    }

    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        try {
            console.log('Profile:', profile);
            
            
            const { emails, name, photos } = profile;
    
            if(!emails || !name) {
                console.log('Error: No se pudo obtener la información de perfil');
                return done(new Error('No se pudo obtener la informacion de perfil'), false)
            }
    
            const email = emails[0].value;
            const profileImage = photos && photos.length > 0 ? photos[0].value : 'URL_DE_IMAGEN_DEFAULT';

            console.log(email);
            
            
                // Aquí puedes extraer más datos del perfil si es necesario
            const user = await this.authService.findUserByEmail(email);
            console.log(user);
            
    
            if(!user) {
                console.log('Error: Usuario no encontrado');
                // return done(null, { message: 'Usuario no encontrado' });
                return done(null, { userExists: false });
                
            }
    
            const token = await this.authService.generateJwt(user);
            console.log('Token:', token);
            
            done(null,{...user, token, profileImage});
                
        } catch (error) {
            console.error('Error en la validación de GoogleStrategy:', error);
            done(error, false);
        }
    };
    
}
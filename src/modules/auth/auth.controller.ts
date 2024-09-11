import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from '../users/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService) {}

    @Get()
    @ApiOperation({ summary: 'Get auth', description: 'Get auth' })
    @ApiResponse({ status: 200, description: 'Auth retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Auth not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    getAuth() {
        return this.authService.getAuth();
    }

    @Post('signup')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'signup', description: 'signup' })
    @ApiResponse({ status: 200, description: 'signup retrieved successfully' })
    @ApiResponse({ status: 404, description: 'signup not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    signUp(@Body() user: CreateUserDto, @UploadedFile( new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 200000,
            message: 'Supera el peso máximo permitido (no mayor a 200kb)',
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp|svg|gif)/,
          }),
        ],
      }),
    )
    file?: Express.Multer.File) {
        return this.authService.signUp(user, file);
    }

    @Post('signin')
    @ApiOperation({ summary: 'signin', description: 'Signin user' })
    @ApiResponse({ status: 200, description: 'User signed in successfully' })
    @ApiResponse({ status: 400, description: 'Invalid credentials' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async signIn(@Body() credential: LoginUserDto) {
    const { email, password } = credential;
    return await this.authService.signIn(email, password);
}

    @Get('google')
    @ApiOperation({ summary: 'Get google auth', description: 'Get google auth' })
    @ApiResponse({ status: 200, description: 'Google auth retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Google auth not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(AuthGuard('google'))
    async googlelogin() {

    }

    @Get('google/callback')
    @ApiOperation({ summary: 'Get google callback', description: 'Get google callback' })
    @ApiResponse({ status: 200, description: 'Google callback retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Google callback not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(AuthGuard('google'))
    
    async callback(@Req() req, @Res() res) {
        console.log(req);
        const { user } = req;
        console.log(user);
        
    
        if (!user) {
            return res.status(400).send('No se pudo autenticar el usuario');
        }
    
        if (user.message === 'Usuario no encontrado') {
            return res.redirect('https://pf-grupo03.vercel.app/auth/signup');
        }
    
        res.setHeader('Authorization', `Bearer ${user.token}`);
        res.json(user);
        const redirectUrl = 'https://pf-grupo03.vercel.app';
        return res.redirect(redirectUrl);
    }
    

    @Get('test')
    @ApiOperation({ summary: 'Get test', description: 'Get test' })
    @ApiResponse({ status: 200, description: 'Test retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Test not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(AuthGuard('jwt'))
    async test(@Res() res) {
        res.json('success');
    }

}

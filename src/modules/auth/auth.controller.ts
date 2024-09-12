import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, ParseFilePipe, Post, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
    async signUp(
      @Body() user: CreateUserDto,
      @UploadedFile() file?: Express.Multer.File
    ) {
      if (file) {
        const maxSize = 200000;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

        if (file.size > maxSize) {
          throw new BadRequestException('Supera el peso máximo permitido (no mayor a 200kb)');
        }

        if (!validTypes.includes(file.mimetype)) {
          throw new BadRequestException('Tipo de archivo no permitido (jpg, jpeg, png, webp, svg, gif)');
        }
      }

      return await this.authService.signUp(user, file);
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
    async googlelogin(@Req() req, @Res() res) {
        res.redirect('/auth/google/callback');
    }

    @Get('google/callback')
    @ApiOperation({ summary: 'Get google callback', description: 'Get google callback' })
    @ApiResponse({ status: 200, description: 'Google callback retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Google callback not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(AuthGuard('google'))
    
    async callback(@Req() req, @Res() res) {
    //     const { user } = req;
    //     console.log('User object in callback:', user);
        
        
    
    //     if (!user) {
    //         return res.status(400).send('No se pudo autenticar el usuario');
    //     }
    
    //     if (user.message === 'Usuario no encontrado') {
    //         return res.redirect('https://pf-grupo03.vercel.app/register');
    //     }
    
    //     // res.clearCookie('auth_token');
    //     res.setHeader('Authorization', `Bearer ${user.token}`);
    //     res.json(user);
    //     // const redirectUrl = 'https://pf-grupo03.vercel.app';
    //     // return res.redirect(redirectUrl);
    // }

  //   try {
  //     const { user } = req;
  
  //     if (!user) {
  //       throw new UnauthorizedException('Error de autenticación: Usuario no encontrado');
  //     }
  
  //     if (user.message === 'Usuario no encontrado') {
  //       return await res.redirect('https://pf-grupo03.vercel.app/register');
  //     }
  
  //     // Usuario autenticado correctamente
  //     res.setHeader('Authorization', `Bearer ${user.token}`);
  //     res.json(user);
      
  
  //   } catch (error) {
  //     console.error('Error en la autenticación de Google:', error);
  //   //   if (error instanceof UnauthorizedException) {
  //   //     // Manejar error de autenticación no autorizado
  //   //     return res.status(401).json({ message: error.message });
  //   //   } else {
  //   //     // Manejar otros errores
  //   //     return res.status(500).json({ message: 'Error interno del servidor' });
  //   //   }
  //   // }
  //   if (error instanceof UnauthorizedException) {
  //     return res.status(401).json({ message: 'Credenciales inválidas' });
  //   } else if (error instanceof NotFoundException) {
  //     return res.redirect('https://pf-grupo03.vercel.app/register');
  //   } else {
  //     return res.status(500).json({ message: 'Error interno del servidor' });
  //   }
  // }

    try {
      const { user } = req;

      // User object retrieved from GoogleStrategy
      // if (!user) {
      //   return res.status(400).json({ message: 'No se pudo autenticar el usuario' });
      // }

      // Check user existence and role (optional)
      if (user && user.userExists) {
        // Redirect to registration page
        return res.redirect('https://pf-grupo03.vercel.app/register');
      } else if (user.isAdmin) {
        // Redirect to admin dashboard
        return res.redirect('https://pf-grupo03.vercel.app/admin-dashboard');
      } 

      // Default redirect to home for other users
      res.cookie('authToken', user.token, { httpOnly: true });
      return res.redirect('https://pf-grupo03.vercel.app/');

    } catch (error) {
      console.error('Error en la autenticación de Google:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

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

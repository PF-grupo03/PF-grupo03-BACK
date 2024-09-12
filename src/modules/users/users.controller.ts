import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  bannedUserDto,
  FiltersUsersDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from './roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: 'Get all users', description: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Get()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  getUsers(@Query() params?: FiltersUsersDto) {
    return this.userService.getUsers(params);
  }

  @ApiOperation({ summary: 'Get user by ID', description: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(AuthGuard)
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }

  @ApiOperation({
    summary: 'Get user by email',
    description: 'Get user by email',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('getByEmail/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Update user by ID',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(AuthGuard)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() userBody: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, userBody);
  }

  @Put('image-profile/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateImageProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
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
    file: Express.Multer.File,
  ) {
    return this.userService.updateImageProfile(id, file);
  }

  @ApiOperation({
    summary: 'Change password of user by ID',
    description: 'Change password of user by ID',
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Put('change-password/:id')
  @UseGuards(AuthGuard)
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() newPassword: UpdateUserPasswordDto,
  ) {
    return this.userService.changePassword(id, newPassword);
  }

  @ApiOperation({ summary: 'Make user admin', description: 'Make user admin' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put('make-admin/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async makeAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.makeAdmin(id);
  }

  @ApiOperation({
    summary: 'Remove admin role',
    description: 'Remove admin role',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put('remove-admin/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async removeAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.removeAdmin(id);
  }

  @ApiOperation({ summary: 'Ban user', description: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put('ban-user/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async banUser(
    @Body() bannedUserDto: bannedUserDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.userService.banUser(bannedUserDto, id);
  }

  @ApiOperation({ summary: 'Unban user', description: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put('unban-user/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async unbanUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.unbanUser(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Delete user by ID',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.deleteUser(id);
  }

  @ApiOperation({
    summary: 'Delete profile image user',
    description: 'Delete profile image user',
  })
  @Roles(Role.User)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete('image-profileDelete/:id')
  deleteProfileImage(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.deleteProfileImage(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { bannedUserDto, FiltersUsersDto, UpdateUserDto } from './user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from './roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

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

  @ApiOperation({ summary: 'Get user by email', description: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':email')
  getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @ApiOperation({ summary: 'Update user by ID', description: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(AuthGuard)
  updateUser(@Param('id', ParseUUIDPipe) id: string,@Body() userBody: UpdateUserDto,) {
  return this.userService.updateUser(id, userBody);
  }

  @ApiOperation({ summary: 'Make user admin', description: 'Make user admin' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put('make-admin/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard,RolesGuard)
  async makeAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.makeAdmin(id);
  }

  @ApiOperation({ summary: 'Ban user', description: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  @Put('ban-user/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard,RolesGuard)
  async banUser(@Body() bannedUserDto: bannedUserDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.userService.banUser(bannedUserDto, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID', description: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard,RolesGuard)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.deleteUser(id);
  }


}

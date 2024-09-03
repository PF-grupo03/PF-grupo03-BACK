import { PickType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  Min,
  IsEmpty,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'DNI of the user',
    example: 12345678,
  })
  @IsNumber()
  dni: number;

  @ApiProperty({
    description: 'Phone number of the user',
    example: 1123456789,
  })
  @IsNumber()
  phone: number;

  @ApiHideProperty()
  @IsEmpty()
  isActive?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  IsAdmin?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  IsBanned?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email of the user',
    example: 'johndoe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'DNI of the user',
    example: 12345678,
  })
  @IsOptional()
  @IsNumber()
  dni?: number;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: 1123456789,
  })
  @IsOptional()
  @IsNumber()
  phone?: number;


  @ApiHideProperty()
  @IsEmpty()
  isActive?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  isAdmin?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  isBanned?: boolean;
}

export class FiltersUsersDto {
  @ApiPropertyOptional({
    description: 'Limit the number of results',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  page?: number;

  @ApiPropertyOptional({
    description: 'Filter by name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email',
    example: 'johndoe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class LoginUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}

export class mailUserDto extends PickType(CreateUserDto, ['name', 'email']) {}

export class bannedUserDto {
  @ApiProperty({
    example: 'usuario suspendido por infligir nuestras nomrmas',
  })
  @IsString()
  motive: string;
}

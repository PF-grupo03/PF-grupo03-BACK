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
  Matches,
  MinLength,
  MaxLength,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario que debe ser único y contener solo caracteres alfanuméricos y guiones bajos. Se utiliza como identificador en la plataforma.',
    example: 'user_name123',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @Length(3, 20, { message: 'El nombre de usuario debe tener entre 3 y 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' })
  username: string;

  @ApiProperty({
    description: 'Nombre completo del usuario, solo se permiten letras y espacios.',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {message: 'El nombre no puede contener numeros ni caracteres especiales, solo se aceptan letras'})
  name: string;

  @ApiProperty({
    description: 'Correo electrónico válido del usuario. Debe seguir el formato estándar de emails.',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, y un número, y tener al menos 8 caracteres',
    example: 'aaBB3366',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @Matches(/^(?=.[a-z])(?=.[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número, y tener al menos 8 caracteres',
  })
  password: string;

  @ApiProperty({
    description: 'Número de identificación nacional del usuario (DNI).',
    example: 12345678,
  })
  @IsNumber()
  dni: number;

  @ApiProperty({
    description: 'Número de teléfono del usuario, debe contener solo números.',
    example: 1123456789,
  })
  @IsNumber()
  phone: number;

  @ApiHideProperty()
  @IsEmpty({ message: 'Este campo es manejado internamente y no debe ser modificado.' })
  isActive?: boolean;

  @ApiHideProperty()
  @IsEmpty({ message: 'Este campo es manejado internamente y no debe ser modificado.' })
  IsAdmin?: boolean;

  @ApiHideProperty()
  @IsEmpty({ message: 'Este campo es manejado internamente y no debe ser modificado.' })
  IsBanned?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  imageProfile?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre de usuario único, debe contener solo caracteres alfanuméricos y guiones bajos. Se utiliza como identificador en la plataforma.',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario, solo se permiten letras y espacios.',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico válido del usuario. Debe seguir el formato estándar de emails.',
    example: 'johndoe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, y un número, y tener al menos 8 caracteres',
    example: 'aaBB3366',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
 /*  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número, y tener al menos 8 caracteres',
  }) */
  password?: string;

  @ApiPropertyOptional({
    description: 'Número de identificación nacional del usuario (DNI).',
    example: 12345678,
  })
  @IsOptional()
  @IsNumber()
  dni?: number;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario, debe contener solo números.',
    example: 1123456789,
  })
  @IsOptional()
  @IsNumber()
  phone?: number;


  @ApiHideProperty()
  @IsEmpty({ message: 'Este campo es manejado internamente y no debe ser modificado.' })
  isActive?: boolean;

  @ApiHideProperty()
  @IsEmpty({ message: 'Este campo es manejado internamente y no debe ser modificado.' })
  isAdmin?: boolean;

  @ApiHideProperty()
  @IsEmpty({ message: 'Este campo es manejado internamente y no debe ser modificado.' })
  isBanned?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  imageProfile?: string;
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
    example: 'usuario suspendido por infligir nuestras normas',
  })
  @IsString()
  motive: string;
}


  export class UpdateUserPasswordDto {
    @ApiPropertyOptional({
      description: 'Password del usuario',
      example: 'aaBB3366',
    })
    @IsString()
    @MinLength(8)
    @MaxLength(15)
    @Matches(/^(?=.[a-z])(?=.[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message: 'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número, y tener al menos 8 caracteres',
    })
    password: string;
  }
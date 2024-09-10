import { IsString, IsArray, ValidateNested, IsOptional, IsNumber, IsPositive, Validate, IsEmpty, IsBoolean, Min, IsNotEmpty, IsUUID, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @IsString()
  id: string;
}

@ValidatorConstraint({ name: 'atLeastOneAdult', async: false })
class AtLeastOneAdultConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: any) {
    const { adults } = args.object as CreateOrderDto;
    return adults > 0;
  }

  defaultMessage(args: any) {
    return 'At least one adult must be specified';
  }
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Identificador único del usuario generado por la base de datos (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @ApiProperty({
    description: 'fecha de inicio del viaje',
    example: '2024-09-12'
  })
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  adults: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  children: number = 0;

  @ApiHideProperty()
  @IsEmpty()
  stripeSessionId: string;

  @ApiHideProperty()
  @IsEmpty()
  status: string;

  @Validate(AtLeastOneAdultConstraint)
  validateAdults() {}

  @IsBoolean()
  medicalInsurance: boolean = false;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}

export class PassengerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  cellphone: string;

  @IsString()
  dni: string;
}
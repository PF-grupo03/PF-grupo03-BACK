import { Transform, Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEmpty,
  IsOptional,
  IsPositive,
  Min,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { CategoryEntity } from '../categories/category.entity';

export class CreateProductDto {

  @ApiProperty({
    description: 'Ubicación del paquete de viaje',
    example: 'Rome, Italy',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Título del paquete de viaje',
    example: 'Colosseum Guided Tour with Skip-the-Line',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descripción detallada del paquete de viaje',
    example:
      'Explore the iconic Colosseum with a professional guide and skip the long lines',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Descripción adicional del paquete de viaje',
    example:
      'Explore the iconic Colosseum with a professional guide and skip the long lines',
  })
  @IsNotEmpty()
  @IsString()
  description2: string;

  @ApiProperty({
    description: 'Precio del paquete de viaje',
    example: 127,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'cantidad de viajes del paquete de viaje',
    example: 30,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  stock: number;

  @ApiProperty({
    description: 'Duración del paquete de viaje',
    example: '1 Day',
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiPropertyOptional({
    description: 'Latitud de la ubicación del producto',
    example: 40.416775,
  })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la ubicación del producto',
    example: -3.703790,
  })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiHideProperty()
  @IsEmpty()
  isActive?: boolean;

  @ApiProperty({
    description: 'Categorías asociadas al paquete de viaje',
    example: ['adventure', 'history'],
  })
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return value;
  })
  categories: string[];

  @ApiProperty({
    description: 'Fechas disponibles para el paquete de viaje',
    example: { availableDates: ['2024-09-10', '2024-09-11'] },
  })
  @IsOptional()
  travelDate?: { availableDates: string[] };
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Ubicación del paquete de viaje',
    example: 'Rome, Italy',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Título del paquete de viaje',
    example: 'Colosseum Guided Tour with Skip-the-Line',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del paquete de viaje',
    example:
      'Explore the iconic Colosseum with a professional guide and skip the long lines',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Descripción adicional del paquete de viaje',
    example:
      'Explore the iconic Colosseum with a professional guide and skip the long lines',
  })
  @IsOptional()
  @IsString()
  description2?: string;

  @ApiPropertyOptional({
    description: 'Precio del paquete de viaje',
    example: 127,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    description: 'cantidad de viajes del paquete de viaje',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({
    description: 'Duración del paquete de viaje',
    example: '1 Day',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Latitud de la ubicación del producto',
    example: 40.416775,
  })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la ubicación del producto',
    example: -3.703790,
  })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiHideProperty()
  @IsEmpty()
  isActive?: boolean;


  @ApiPropertyOptional({
    description: 'Categorías asociadas al paquete de viaje',
    example: ['Brasil', 'America'],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @IsOptional()
  categories?: CategoryEntity[];

  @ApiPropertyOptional({
    description: 'Fechas disponibles para el paquete de viaje',
    example: { availableDates: ['2024-09-10', '2024-09-11'] },
  })
  @IsOptional()
  travelDate?: { availableDates: string[] };
}

export class FiltersProductsDto {
  @ApiPropertyOptional({
    description: 'Limitar el número de resultados',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  page?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por título del paquete de viaje',
    example: 'Colosseum Guided Tour with Skip-the-Line',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ubicación',
    example: 'Rome, Italy',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por duración del paquete de viaje',
    example: '1 Day',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por precio máximo',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @Max(5000)
  maxPrice?: number;

  // @ApiPropertyOptional({
  //   description: 'Filtrar por estado activo',
  //   example: true,
  // })
  // @IsOptional()
  // @IsBoolean()
  // @Type(() => Boolean)
  // isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por categorías',
    example: 'diseño de sonrisa o ["diseño de sonrisa", "implantes dentales"]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && !value.startsWith('[')) {
      return [value];
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [value];
      }
    }

    return value;
  })
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}

export type TWhereClause = {
  title?: string;
  location?: string;
  price?: number;
  duration?: string;
  isActive?: boolean;
};

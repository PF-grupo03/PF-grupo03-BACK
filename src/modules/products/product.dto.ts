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
} from 'class-validator';
import { CategoryEntity } from '../categories/category.entity';

export class CreateProductDto {
  @ApiProperty({
    description: 'URL de la imagen principal del paquete de viaje',
    example: 'https://example.com/colosseum-tour.jpg',
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    description: 'URL de la segunda imagen del paquete de viaje',
    example: 'https://example.com/colosseum-tour2.jpg',
  })
  @IsNotEmpty()
  @IsString()
  image2: string;

  @ApiProperty({
    description: 'URL de la tercera imagen del paquete de viaje',
    example: 'https://example.com/colosseum-tour3.jpg',
  })
  @IsNotEmpty()
  @IsString()
  image3: string;

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
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'cantidad de viajes del paquete de viaje',
    example: 30,
  })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiProperty({
    description: 'Duración del paquete de viaje',
    example: '1 Day',
  })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiHideProperty()
  @IsEmpty()
  isActive?: boolean;

  @ApiProperty({
    description: 'Categorías asociadas al paquete de viaje',
    example: ['adventure', 'history'],
  })
  @IsArray()
  @IsString({ each: true })
  categories: string[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'URL de la imagen principal del paquete de viaje',
    example: 'https://example.com/colosseum-tour.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'URL de la segunda imagen del paquete de viaje',
    example: 'https://example.com/colosseum-tour2.jpg',
  })
  @IsOptional()
  @IsString()
  image2?: string;

  @ApiPropertyOptional({
    description: 'URL de la tercera imagen del paquete de viaje',
    example: 'https://example.com/colosseum-tour3.jpg',
  })
  @IsOptional()
  @IsString()
  image3?: string;

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

  @ApiHideProperty()
  @IsBoolean()
  isActive?: boolean;

  @ApiHideProperty()
  @IsEmpty()
  categories?: CategoryEntity[];
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
    description: 'Filtrar por precio',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por duración del paquete de viaje',
    example: '1 Day',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por categorías',
    example: '["diseño de sonrisa"]',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Intenta convertir el string a un array
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        // Si no se puede convertir, retorna un array vacío o lanza un error
        return [];
      }
    }
    return value; // Si ya es un array, lo devuelve tal cual
  })
  categories?: string[];
}

export type TWhereClause = {
  title?: string;
  location?: string;
  price?: number;
  duration?: string;
  isActive?: boolean;
};

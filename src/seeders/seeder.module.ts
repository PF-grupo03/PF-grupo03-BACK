import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/modules/categories/category.entity';
import { ProductEntity } from 'src/modules/products/product.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    TypeOrmModule.forFeature([ProductEntity]),
  ],
  providers: [SeederService],
})
export class SeederModule {}

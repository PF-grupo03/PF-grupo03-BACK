import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductsRepository } from './product.repository';
import { CategoryEntity } from '../categories/category.entity';
import { CategoriesModule } from '../categories/categories.module';
import { FileUploadRepository } from '../file-upload/file-upload.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, CategoryEntity]),
    CategoriesModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, FileUploadRepository],
})
export class ProductsModule {}

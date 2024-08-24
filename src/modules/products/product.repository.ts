import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { Repository } from 'typeorm';
import {
  CreateProductDto,
  FiltersProductsDto,
  UpdateProductDto,
} from './product.dto';
import { CategoryEntity } from '../categories/category.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getProducts(params?: FiltersProductsDto) {
    const { limit, page, name, price } = params;
    try {
      return await this.productsRepository.find({
        where: {
          name: name || undefined,
          price: price || undefined,
          isActive: true,
        },
        take: limit || undefined,
        skip: page || undefined,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error obteniendo productos');
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.productsRepository.findOne({
        where: { id, isActive: true },
        relations: {
          categories: true,
        },
      });
      if (!product) {
        throw new BadRequestException('ID de producto incorrecto');
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException('Error obteniendo el producto');
    }
  }

  async createProduct(product: CreateProductDto) {
    try {
      const categories = await this.categoriesRepository.find({
        where: {
          isActive: true,
        },
      });
      const categoryMatch = categories.filter((category) => {
        product.categories.includes(category.name)
      })
      if (categoryMatch.length !== product.categories.length) {
        throw new BadRequestException('Categorías no fueron encontradas');
      }
      const newProduct = this.productsRepository.create({
        ...product,
        categories: categoryMatch,
      });
      return await this.productsRepository.save(newProduct);
    } catch (error) {
      throw new InternalServerErrorException('Error obteniendo el producto');
    }
  }

  async updateProduct(id: string, product: UpdateProductDto) {
    try {
      const productById = await this.productsRepository.findOne({
        where: { id, isActive: true },
        relations: {
          categories: true,
        },
      });
      if (!productById) {
        throw new Error('Id de producto inexistente');
      }
      await this.productsRepository.update(id, product);
      return await this.productsRepository.findOne({
        where: { id, isActive: true },
        relations: {
          categories: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error actualizando el producto');
    }
  }

  async deleteProduct(id: string) {
    try {
      const productById = await this.productsRepository.findOne({
        where: { id, isActive: true },
        relations: {
          categories: true,
        },
      });
      if (!productById) {
        throw new Error('Id de producto inexistente');
      }
      productById.isActive = false;
      await this.productsRepository.save(productById);
      return 'Producto eliminado correctamente';
    } catch (error) {
      throw new InternalServerErrorException('Error eliminando el producto');
    }
  }
}

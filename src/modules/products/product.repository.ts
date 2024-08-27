import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { Repository, In } from 'typeorm';
import {
  CreateProductDto,
  FiltersProductsDto,
  TWhereClause,
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
    const { limit, page, title, location, price, duration, categories } = params;
    // console.log(isActive)
    try {
      const whereClause: TWhereClause = {}
        if (title) whereClause.title = title;
        if (location) whereClause.location = location;
        if (price) whereClause.price = price;
        if (duration) whereClause.duration = duration;
        // if (typeof isActive === 'undefined') whereClause.isActive = isActive
        // console.log('whereClause:', whereClause);

        const products = await this.productsRepository.find({
          where: whereClause,
          take: limit || undefined,
          skip: page ? (page - 1) * limit : undefined,
          relations: {
              categories: true,
          },
      });
 
      if (categories && categories.length > 0) {
          return products.filter(product => 
              product.categories.some(category => categories.includes(category.name))
          );
      }

      return products;
    } catch (error) {
      console.log(error);
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

  async createProduct(product: CreateProductDto, files: { imageUrl: string; image2Url: string; image3Url: string }) {
    try {
      const categories = await this.categoriesRepository.find({
        where: {
          name: In(product.categories),
          isActive: true,
        },
      });

      if (categories.length !== product.categories.length) {
        throw new BadRequestException('Una o más categorías no fueron encontradas');
      }

      const newProduct = this.productsRepository.create({
        ...product,
        categories,
        image: files.imageUrl,
        image2: files.image2Url,
        image3: files.image3Url
      });

      return await this.productsRepository.save(newProduct);
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Error creando el producto');
    }
  }

  async updateProduct(id: string, product: UpdateProductDto) {
    try {
      const existingProduct = await this.productsRepository.findOne({
        where: { id, isActive: true },
        relations: {
          categories: true,
        },
      });

      if (!existingProduct) {
        throw new BadRequestException('ID de producto inexistente');
      }

      if (product.categories) {
        const categories = await this.categoriesRepository.find({
          where: {
            name: In(product.categories),
            isActive: true,
          },
        });

        if (categories.length !== product.categories.length) {
          throw new BadRequestException('Una o más categorías no fueron encontradas');
        }

        product.categories = categories;
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
          categories: true },
      });

      if (!productById) {
        throw new BadRequestException('ID de producto inexistente');
      }

      productById.isActive = false;
      await this.productsRepository.save(productById);
      return 'Producto eliminado correctamente';
    } catch (error) {
      throw new InternalServerErrorException('Error eliminando el producto');
    }
  }
}


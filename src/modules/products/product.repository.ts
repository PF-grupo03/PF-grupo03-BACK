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
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getProducts(params?: FiltersProductsDto) {
    const { limit, page, title, location, maxPrice, duration, categories } =
      params;
    try {
      // const whereClause: TWhereClause = {};
      // if (title) whereClause.title = title;
      // if (location) whereClause.location = location;
      // if (duration) whereClause.duration = duration;
      // whereClause.isActive = true;

      const query = this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'category')
        .where('product.isActive = :isActive', { isActive: true });

      if (title) {
        query.andWhere('product.title ILIKE :title', { title: `%${title}%` });
      }

      if (duration) {
        query.andWhere('product.duration ILIKE :duration', {
          duration: `%${duration}%`,
        });
      }

      if (location) {
        query.andWhere('product.location ILIKE :location', {
          location: `%${location}%`,
        });
      }

      const maxAllowedPrice = maxPrice || 5000;
      query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: 0,
        maxPrice: maxAllowedPrice,
      });

      const categoriesArray = categories
        ? Array.isArray(categories)
          ? categories
          : [categories]
        : [];

      if (categoriesArray.length > 0) {
        query.andWhere('category.name IN (:...categories)', {
          categories: categoriesArray,
        });
      }

      const products = await query
        .take(limit || undefined)
        .skip(page ? (page - 1) * limit : undefined)
        .getMany();

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

  async createProduct(product: CreateProductDto) {
    try {
      const categories = await this.categoriesRepository.find({
        where: {
          name: In(product.categories),
          isActive: true,
        },
      });

      if (categories.length !== product.categories.length) {
        throw new BadRequestException(
          'Una o más categorías no fueron encontradas',
        );
      }

      const newProduct = this.productsRepository.create({
        ...product,
        categories,
      });

      return await this.productsRepository.save(newProduct);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creando el producto');
    }
  }

  async updateProduct(id: string, product: UpdateProductDto) {
    if (!product || Object.keys(product).length === 0) {
      throw new BadRequestException('Introduce al menos un campo a actualizar');
    }
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

      let updatedCategories = existingProduct.categories;

      if (product.categories) {
        const categories = await this.categoriesRepository.find({
          where: {
            name: In(product.categories),
            isActive: true,
          },
        });

        if (categories.length !== product.categories.length) {
          throw new BadRequestException(
            'Una o más categorías no fueron encontradas',
          );
        }

        updatedCategories = categories;
      }

      const updatedProduct = {
        ...product,
        categories: updatedCategories,
      };
  
      await this.productsRepository.update(id, updatedProduct);

      return await this.productsRepository.findOne({
        where: { id, isActive: true },
        relations: {
          categories: true,
        },
      });
    } catch (error) {
      console.log(error)
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
        throw new BadRequestException('ID de producto inexistente');
      }
      const imageFields = ['image', 'image2', 'image3'];

      // Eliminar imágenes de Cloudinary si existen
      for (const field of imageFields) {
        const imageUrl = productById[field];
        if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
          const publicId = imageUrl
            .split('/')
            .slice(-2)
            .join('/')
            .split('.')[0];

          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (destroyError) {
              console.error(
                `Error al eliminar la imagen ${field} de Cloudinary:`,
                destroyError,
              );
              throw new InternalServerErrorException(
                `Error al eliminar la imagen ${field} de Cloudinary`,
              );
            }
          }
        }
      }
      productById.isActive = false;
      await this.productsRepository.save(productById);
      return 'Producto eliminado correctamente';
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error eliminando el producto');
    }
  }
}

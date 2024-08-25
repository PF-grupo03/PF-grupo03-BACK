import data from '../modules/utils/data.json';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from 'src/modules/categories/category.entity';
import { ProductEntity } from 'src/modules/products/product.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async seedProducts() {
    if (!data || !Array.isArray(data)) {
      console.error('No se pudo obtener el array de datos.');
      return;
    }
    const allCategories = Array.from(
      new Set(data.flatMap((product) => product.categories)),
    );
    const categoryEntities = await Promise.all(
      allCategories.map(async (category) => {
        const categoryEntity = await this.categoriesRepository
          .createQueryBuilder()
          .insert()
          .into(CategoryEntity)
          .values({ name: category })
          .orIgnore()
          .execute();
        return {
          id: categoryEntity.identifiers[0].id,
          name: category,
        };
      }),
    );
    await Promise.all(
      data.map(async (product) => {
        const productEntity = this.productsRepository.create({
          title: product.title,
          description: product.description,
          description2: product.description2,
          price: product.price,
          stock: product.stock,
          image: product.image,
          image2: product.image2,
          image3: product.image3,
          duration: product.duration,
          location: product.location,
          categories: categoryEntities.filter((category) =>
            product.categories.includes(category.name),
          ),
        });
        return await this.productsRepository.save(productEntity);
      }),
    );
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './categorie.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async getCategories() {
    try {
      const categories = this.categoriesRepository.find();
      const activeCategories = (await categories).filter(category => category.isActive);
      return activeCategories
    } catch (error) {
      throw new InternalServerErrorException('Error fetching categories from the database.');
    }
  }

  async getCategoryById(id: string) {
    try {
      return await this.categoriesRepository.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching category from the database.');
    }
  }

  async addCategories(data: CreateCategoryDto[]) {
    try {
      await Promise.all(
        data?.map(async (element) => {
          await this.categoriesRepository
            .createQueryBuilder()
            .insert()
            .into(CategoryEntity)
            .values({ name: element.name })
            .orIgnore()
            .execute();
        }),
      );
      return 'Categorías Agregadas Correctamente';
    } catch (error) {
      throw new InternalServerErrorException('Error adding categories to the database');
    }
  }

  async updateCategory(id: string, data: CreateCategoryDto) {
    try {
      await this.categoriesRepository
        .createQueryBuilder()
        .update(CategoryEntity)
        .set({ name: data.name })
        .where({ id })
        .execute();
      return 'Categoría actualizada correctamente';
    } catch (error) {
      throw new InternalServerErrorException('Error updating category in the database');
    }
  }

  async desactivateCategory(id: string) {
    try {
      await this.categoriesRepository
        .createQueryBuilder()
        .update(CategoryEntity)
        .set({ isActive: false })
        .where({ id })
        .execute();
      return 'Categoría desactivada correctamente';
    } catch (error) {
      throw new InternalServerErrorException('Error desactivating category in the database');
    }
}
}
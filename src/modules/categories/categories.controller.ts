import { Controller, Get, Post, Body, BadRequestException, Put, UseGuards, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categorie.dto';
import { ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../users/roles.enum';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get categories', description: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Categories not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category', description: 'Get category using category ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add category', description: 'Add new category' })
  @ApiResponse({ status: 200, description: 'Category added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: [CreateCategoryDto] })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async addCategories(@Body(new ValidationPipe({ whitelist: true })) data: CreateCategoryDto[]) {
    if (!data.length) {
      throw new BadRequestException('No categories provided.');
    }
    return this.categoriesService.addCategories(data);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update category', description: 'update category using category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async updateCategory(@Body('id') id: string, @Body(new ValidationPipe({ whitelist: true })) data: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, data);
  }

  @Put('desactivate')
  @ApiOperation({ summary: 'Desactivate category', description: 'deactivate category using category ID' })
  @ApiResponse({ status: 200, description: 'category successfully deactivated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async desactivateCategory(@Body('id') id: string) {
    return this.categoriesService.desactivateCategory(id);
  }
}

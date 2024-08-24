import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../users/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products', description: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Products not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product', description: 'Get product using product ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product', description: 'Add new product' })
  @ApiResponse({ status: 200, description: 'Product added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: [CreateProductDto] })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  createProduct(@Body() product: CreateProductDto) {
    return this.productsService.createProduct(product)
  }

  @Put()
  @ApiOperation({ summary: 'Update product', description: 'Update product using product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: [UpdateProductDto] })
  @UseGuards(AuthGuard)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() product: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, product);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete product', description: 'Delete product using product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deleteProduct(id);
  }
}

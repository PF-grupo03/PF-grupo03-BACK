import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './product.repository';
import { CreateProductDto, FiltersProductsDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  getProducts(params?: FiltersProductsDto) {
    return this.productsRepository.getProducts(params);
  }

  getProductById(id: string) {
    return this.productsRepository.getProductById(id);
  }

  createProduct(product: CreateProductDto) {
    return this.productsRepository.createProduct(product);
  }

  updateProduct(id: string, product: UpdateProductDto) {
    return this.productsRepository.updateProduct(id, product);
  }

  deleteProduct(id: string) {
    return this.productsRepository.deleteProduct(id);
  }
}

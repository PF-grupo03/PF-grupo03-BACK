import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductsRepository } from './product.repository';
import { CreateProductDto, FiltersProductsDto, UpdateProductDto } from './product.dto';
import { FileUploadRepository } from '../file-upload/file-upload.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository,
    private readonly fileUploadRepository: FileUploadRepository,

  ) {}

  getProducts(params?: FiltersProductsDto) {
    return this.productsRepository.getProducts(params);
  }

  getProductById(id: string) {
    return this.productsRepository.getProductById(id);
  }

  async createProduct(product: CreateProductDto, files: { [key: string]: Express.Multer.File[] }) {

      const imageFields = ['image', 'image2', 'image3'];

      for (const field of imageFields) {
        if (files[field] && files[field].length > 0) {
          const file = files[field][0];
          try {
            const response = await this.fileUploadRepository.uploadImage(file);
            if (!response.secure_url) {
              throw new InternalServerErrorException(`Error al cargar la imagen ${field} en Cloudinary`);
            }
            product[field] = response.secure_url;
          } catch (uploadError) {
            console.error(`Error al cargar la imagen ${field}:`, uploadError);
            throw new InternalServerErrorException(`Error al cargar la imagen ${field}`);
          }
        }
      }
  
    return this.productsRepository.createProduct(product);
  }

  updateProduct(id: string, product: UpdateProductDto) {
    return this.productsRepository.updateProduct(id, product);
  }

  deleteProduct(id: string) {
    return this.productsRepository.deleteProduct(id);
  }
}

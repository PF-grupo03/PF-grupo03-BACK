import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './product.repository';
import { CreateProductDto, FiltersProductsDto, UpdateProductDto } from './product.dto';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  getProducts(params?: FiltersProductsDto) {
    return this.productsRepository.getProducts(params);
  }

  getProductById(id: string) {
    return this.productsRepository.getProductById(id);
  }

  async createProduct(product: CreateProductDto, files: { image: Express.Multer.File; image2: Express.Multer.File; image3: Express.Multer.File }) {
    const uploadImage = async (file: Express.Multer.File) => {
      if (!file) return null;

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'travel_zone_cloudinary',
        use_filename: true,
      });

      return result.secure_url;
    };
    const imageUrl = await uploadImage(files.image);
    const image2Url = await uploadImage(files.image2);
    const image3Url = await uploadImage(files.image3);

    const mappedFiles = {
      imageUrl,
      image2Url,
      image3Url,
    };

    return this.productsRepository.createProduct(product, mappedFiles);
  }

  updateProduct(id: string, product: UpdateProductDto) {
    return this.productsRepository.updateProduct(id, product);
  }

  deleteProduct(id: string) {
    return this.productsRepository.deleteProduct(id);
  }
}

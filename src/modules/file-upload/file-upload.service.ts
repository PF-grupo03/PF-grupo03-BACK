import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../products/product.entity';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  async uploadImages(files: { [key: string]: Express.Multer.File[] }, productId: string) {
    try {
      const product = await this.productsRepository.findOneBy({ id: productId });
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }

      const imageFields = ['image', 'image2', 'image3'];

      for (const field of imageFields) {
        if (product[field] && product[field].includes("res.cloudinary.com")) {
          const publicId = product[field].split("/").pop()?.split(".")[0];
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(`travel_zone_cloudinary/${publicId}`);
            } catch (destroyError) {
              console.error(`Error al eliminar la imagen ${field} de Cloudinary:`, destroyError);
              throw new InternalServerErrorException(`Error al eliminar la imagen ${field} de Cloudinary`);
            }
          }
        }
      }

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

      await this.productsRepository.save(product);

      return product;
    } catch (error) {
      console.error('Error al procesar la carga de imágenes:', error);
      throw new InternalServerErrorException('Error al procesar la carga de imágenes');
    }
  }
}


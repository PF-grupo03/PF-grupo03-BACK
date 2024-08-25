import { Injectable, NotFoundException } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../products/product.entity';

@Injectable()
export class FileUploadService {
    constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
) {}

    async uploadImages(files: { [key: string]: Express.Multer.File }, productId: string) {
    const product = await this.productsRepository.findOneBy({ id: productId });
    if (!product) {
        throw new NotFoundException('Producto no encontrado');
    }

    const imageFields = ['image', 'image2', 'image3'];

    for (const field of imageFields) {
        if (files[field]) {
        const response = await this.fileUploadRepository.uploadImage(files[field]);
        if (!response.secure_url) {
            throw new NotFoundException(`Error al cargar la imagen ${field} en Cloudinary`);
        }
        product[field] = response.secure_url;
        }
    }

    await this.productsRepository.save(product);

    return product;
}
}

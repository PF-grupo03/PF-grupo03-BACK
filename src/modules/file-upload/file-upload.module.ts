// import { Module } from '@nestjs/common';
// import { FileUploadService } from './file-upload.service';
// import { FileUploadController } from './file-upload.controller';
// import { ProductEntity } from '../products/product.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { CloudinaryConfig } from 'src/config/cloudinary.config';
// import { FileUploadRepository } from './file-upload.repository';

// @Module({
//   imports: [TypeOrmModule.forFeature([ProductEntity])],
//   controllers: [FileUploadController],
//   providers: [FileUploadService, CloudinaryConfig, FileUploadRepository],
// })
// export class FileUploadModule {}

import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { ProductEntity } from '../products/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadRepository } from './file-upload.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [FileUploadController],
  providers: [FileUploadService, FileUploadRepository],
})
export class FileUploadModule {}
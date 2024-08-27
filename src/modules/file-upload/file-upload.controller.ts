// import {
//     Controller,
//     FileTypeValidator,
//     MaxFileSizeValidator,
//     Param,
//     ParseFilePipe,
//     Post,
//     UploadedFiles,
//     UseGuards,
//     UseInterceptors,
// } from '@nestjs/common';
//     import { FileUploadService } from './file-upload.service';
//     import { FilesInterceptor } from '@nestjs/platform-express';
//     import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
//     import { AuthGuard } from '../auth/guards/auth.guard';

//     @ApiTags('file-upload')
//     @Controller('file-upload')
//     export class FileUploadController {
//     constructor(private readonly fileUploadService: FileUploadService) {}

//     @Post('uploadImage/:id')
//     @ApiOperation({ summary: 'Upload images for a product', description: 'Upload images for a specific product identified by its ID' })
//     @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
//     @ApiResponse({ status: 400, description: 'Bad request' })
//     @ApiResponse({ status: 500, description: 'Internal server error' })
//     @ApiBearerAuth()
//     @UseGuards(AuthGuard)
//     @ApiConsumes('multipart/form-data')
//     @ApiBody({
//         schema: {
//         type: 'object',
//         properties: {
//         image: {
//             type: 'string',
//             format: 'binary',
//             description: 'Primary image to be uploaded',
//         },
//         image2: {
//             type: 'string',
//             format: 'binary',
//             description: 'Secondary image to be uploaded',
//         },
//         image3: {
//             type: 'string',
//             format: 'binary',
//             description: 'Tertiary image to be uploaded',
//         },
//         },
//     },
//     })
//     @UseInterceptors(FileInterceptor('image'))
//     async uploadImages(
//     @Param('id') productId: string,
//     @UploadedFile(
//         new ParseFilePipe({
//         validators: [
//             new MaxFileSizeValidator({
//               maxSize: 500000, // 200kb
//                 message: 'Supera el máximo permitido: 5000kb',
//             }),
//             new FileTypeValidator({
//             fileType: /(.jpg|.jpeg|.png|.webp)/,
//             }),
//         ],
//         }),
//     ) image: Express.Multer.File,
//         @UploadedFile(
//         new ParseFilePipe({
//         validators: [
//             new MaxFileSizeValidator({
//               maxSize: 500000, // 200kb
//             message: 'Supera el máximo permitido: 5000kb',
//             }),
//             new FileTypeValidator({
//             fileType: /(.jpg|.jpeg|.png|.webp)/,
//             }),
//         ],
//         }),
//     ) image2: Express.Multer.File,
//         @UploadedFile(
//         new ParseFilePipe({
//         validators: [
//             new MaxFileSizeValidator({
//               maxSize: 500000, // 200kb
//                 message: 'Supera el máximo permitido: 5000kb',
//             }),
//             new FileTypeValidator({
//                 fileType: /(.jpg|.jpeg|.png|.webp)/,
//             }),
//             ],
//         }),
//     ) image3: Express.Multer.File,
//     ) {
//     return this.fileUploadService.uploadImages(
//         { image, image2, image3 },
//         productId,
//         );
//     }

// }

import {
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
    UseGuards,
    BadRequestException,
    InternalServerErrorException,
    Param,
    HttpException,
  } from '@nestjs/common';
  import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
  import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { AuthGuard } from '../auth/guards/auth.guard';
  import { FileUploadService } from './file-upload.service';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  
  @ApiTags('file-upload')
  @Controller('file-upload')
  export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) {}
  
    @Post('uploadImages/:id')
    @ApiOperation({ summary: 'Upload images for a product', description: 'Upload up to 3 images for a product' })
    @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
          },
          image2: {
            type: 'string',
            format: 'binary',
          },
          image3: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
      ]),
    )
    async uploadImages(
      @Param('id') productId: string,
      @UploadedFiles() files: { image?: Express.Multer.File[], image2?: Express.Multer.File[], image3?: Express.Multer.File[] },
    ) {
      try {
        return await this.fileUploadService.uploadImages(files, productId);
      } catch (error) {
        throw new InternalServerErrorException('Error uploading images');
      }
    }
  }
  
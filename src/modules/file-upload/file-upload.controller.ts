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
  
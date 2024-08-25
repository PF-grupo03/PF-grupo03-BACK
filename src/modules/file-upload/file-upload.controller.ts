import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
    import { FileUploadService } from './file-upload.service';
    import { FileInterceptor } from '@nestjs/platform-express';
    import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
    import { AuthGuard } from '../auth/guards/auth.guard';

    @ApiTags('file-upload')
    @Controller('file-upload')
    export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) {}

    @Post('uploadImage/:id')
    @ApiOperation({ summary: 'Upload images for a product', description: 'Upload images for a specific product identified by its ID' })
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
            description: 'Primary image to be uploaded',
        },
        image2: {
            type: 'string',
            format: 'binary',
            description: 'Secondary image to be uploaded',
        },
        image3: {
            type: 'string',
            format: 'binary',
            description: 'Tertiary image to be uploaded',
        },
        },
    },
    })
    @UseInterceptors(FileInterceptor('image'))
    async uploadImages(
    @Param('id') productId: string,
    @UploadedFile(
        new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({
              maxSize: 200000, // 200kb
                message: 'Supera el máximo permitido: 200kb',
            }),
            new FileTypeValidator({
            fileType: /(.jpg|.jpeg|.png|.webp)/,
            }),
        ],
        }),
    ) image: Express.Multer.File,
        @UploadedFile(
        new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({
              maxSize: 200000, // 200kb
            message: 'Supera el máximo permitido: 200kb',
            }),
            new FileTypeValidator({
            fileType: /(.jpg|.jpeg|.png|.webp)/,
            }),
        ],
        }),
    ) image2: Express.Multer.File,
        @UploadedFile(
        new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({
              maxSize: 200000, // 200kb
                message: 'Supera el máximo permitido: 200kb',
            }),
            new FileTypeValidator({
                fileType: /(.jpg|.jpeg|.png|.webp)/,
            }),
            ],
        }),
    ) image3: Express.Multer.File,
    ) {
    return this.fileUploadService.uploadImages(
        { image, image2, image3 },
        productId,
        );
    }
}

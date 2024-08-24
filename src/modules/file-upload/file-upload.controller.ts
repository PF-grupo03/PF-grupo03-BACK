import { Controller, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) {}

    @Post('uploadImage/:id')
    @ApiOperation({ summary: 'Upload image for a product', description: 'Upload an image for a specific product identified by its ID' })
    @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to be uploaded'
                }
            }
        }
    })

    @UseInterceptors(FileInterceptor('file'))
    uploadImage(
        @Param('id') productId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 200000,
                        message: 'Supera el maximo permitido: 200kb'
                    }),
                    new FileTypeValidator({
                        fileType: /(.jpg|.jpeg|.png|.webp)/,
                    })
                ]
            })
        ) file: Express.Multer.File,
    ){
        return this.fileUploadService.uploadImage(file, productId);
    }
}

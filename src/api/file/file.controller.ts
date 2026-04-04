import { ErrorCode } from '@/constants/error-code.constant';
import { ApiPublic } from '@/decorators/http.decorators';
import { ValidationException } from '@/exceptions/validation.exception';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadMultiple, UploadSingle } from './decorators/file.decorator';
import { FileService } from './file.service';

@ApiTags('Files')
@Controller({ path: 'files', version: '1' })
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload file',
    description: 'Single file upload',
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          example: 'avatars',
        },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    return this.fileService.upload(file, folder);
  }

  @Delete(':publicId')
  @ApiPublic({
    summary: 'Delete file',
    description: 'Delete file by publicId',
  })
  async delete(@Param('publicId') publicId: string) {
    return this.fileService.delete(publicId);
  }

  @Post('images/upload')
  @ApiOperation({
    summary:
      'This endpoint uploads an image. Support multiple sizes and thumbnails.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload + options',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars' },
        sizes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'small' },
              width: { type: 'number', example: 200 },
            },
          },
        },
        generateThumbnail: { type: 'boolean', example: true },
        thumbnailWidth: { type: 'number', example: 250 },
      },
    },
  })
  @UploadSingle('file')
  @ApiResponse({ status: 201, description: 'Uploaded successfully' })
  uploadSingle(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.fileService.uploadImage(file, {
      folder: body.folder,
      sizes: body.sizes,
      generateThumbnail: body.generateThumbnail,
      thumbnailWidth: body.thumbnailWidth,
    });
  }

  @Post('multi')
  @ApiPublic({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multi file upload',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          required: ['files[0]', 'files[1]'],
        },
        folder: { type: 'string', example: 'gallery' },
        sizes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'preview' },
              width: { type: 'number', example: 500 },
            },
          },
        },
      },
    },
  })
  @UploadMultiple('files')
  uploadMulti(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    if (!files || files.length === 0 || files.length > 2)
      throw new ValidationException(ErrorCode.E001, 'No files provided');

    return this.fileService.uploadImages(files, {
      folder: body.folder,
      sizes: body.sizes,
    });
  }

  @Post('docs')
  @ApiOperation({ summary: 'Upload file sync' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload + options',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars' },
      },
    },
  })
  @UploadSingle('file')
  @ApiResponse({ status: 201, description: 'Uploaded successfully' })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadFile(file, {
      folder: 'docs',
      allowedMimeTypes: ['text/plain'],
      maxFileSize: 5 * 1024 * 1024,
    });
  }
}

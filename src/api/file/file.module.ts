import { StorageModule } from '@/storage/storage.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TransformationParser } from './parsers/transformation.parser';
import { TransformController } from './transform.controller';
import { ImageTransformer } from './transformers/image.transformer';
import { VideoTransformer } from './transformers/video.transformer';
import { FileValidator } from './validators/file.validator';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), StorageModule],
  controllers: [FileController, TransformController],
  providers: [
    FileService,
    TransformationParser,
    ImageTransformer,
    VideoTransformer,
    FileValidator,
  ],
})
export class FileModule {}

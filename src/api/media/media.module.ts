import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import { MediaEntity } from '../media/entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { TransformationParser } from './parsers/transformation.parser';
import { TransformController } from './transform.controller';
import { ImageTransformer } from './transformers/image.transformer';
import { VideoTransformer } from './transformers/video.transformer';
import { FileValidator } from './validators/file.validator';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity]), StorageModule],
  controllers: [MediaController, TransformController],
  providers: [
    MediaService,
    TransformationParser,
    ImageTransformer,
    VideoTransformer,
    FileValidator,
  ],
})
export class MediaModule {}

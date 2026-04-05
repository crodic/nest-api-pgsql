import { FileStorageModule } from '@/libs/filesystem/lib/file-storage.module';
import { StorageModule } from '@/storage/storage.module';
import { ImageTransformer } from '@/utils/transformers/image.transformer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TransformationParser } from './parsers/transformation.parser';
import { TransformController } from './transform.controller';
import { FileValidator } from './validators/file.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    StorageModule,
    FileStorageModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        default: 'local',
        disks: {
          local: {
            driver: 'local',
            root: `storage/public`,
            basePublicUrl: 'http://localhost:8000',
          },
          private: {
            driver: 'local',
            root: 'storage/private',
            basePublicUrl: 'http://localhost:8000',
          },
        },
      }),
      injectables: ['local', 'private'],
    }),
  ],
  controllers: [FileController, TransformController],
  providers: [
    FileService,
    TransformationParser,
    ImageTransformer,
    FileValidator,
  ],
})
export class FileModule {}

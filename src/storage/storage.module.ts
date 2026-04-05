import { AllConfigType } from '@/config/config.type';
import { FileStorageModule } from '@/libs/filesystem/lib/file-storage.module';
import { DriverType } from '@/libs/storage';
import { StorageModule as NestStorageModule } from '@/libs/storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestStorageModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService<AllConfigType>) => ({
        default: configService.getOrThrow<AllConfigType>(
          'storage.fileSystemDisk',
          {
            infer: true,
          },
        ),
        disks: {
          local: {
            driver: DriverType.LOCAL,
            config: {
              root: `storage/private`,
            },
          },
          public: {
            driver: DriverType.LOCAL,
            config: {
              root: `storage/public`,
            },
          },
          s3: {
            driver: DriverType.S3,
            config: {
              accessKeyId: configService.getOrThrow<AllConfigType>(
                'storage.awsAccessKeyId',
                { infer: true },
              ),
              secretAccessKey: configService.getOrThrow<AllConfigType>(
                'storage.awsSecretAccessKey',
                { infer: true },
              ),
              region: configService.getOrThrow<AllConfigType>(
                'storage.awsRegion',
                { infer: true },
              ),
            },
          },
        },
      }),
    }),
    FileStorageModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        default: config.getOrThrow<AllConfigType>('storage.fileSystemDisk', {
          infer: true,
        }),
        disks: {
          local: {
            driver: 'local',
            root: `storage/private`,
            basePublicUrl: config.getOrThrow<AllConfigType>('app.url', {
              infer: true,
            }),
          },
          public: {
            driver: 'local',
            root: 'storage/public',
            basePublicUrl: config.getOrThrow<AllConfigType>('app.url', {
              infer: true,
            }),
          },
          s3: {
            driver: 's3',
            accessKeyId: config.getOrThrow<AllConfigType>(
              'storage.awsAccessKeyId',
              { infer: true },
            ),
            secretAccessKey: config.getOrThrow<AllConfigType>(
              'storage.awsSecretAccessKey',
              { infer: true },
            ),
            region: config.getOrThrow<AllConfigType>('storage.awsRegion', {
              infer: true,
            }),
            bucket: config.getOrThrow<AllConfigType>('storage.awsBucket', {
              infer: true,
            }),
          },
        },
      }),
      injectables: ['local', 'public', 's3'],
    }),
  ],
})
export class StorageModule {}

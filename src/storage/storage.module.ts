import { AllConfigType } from '@/config/config.type';
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
  ],
})
export class StorageModule {}

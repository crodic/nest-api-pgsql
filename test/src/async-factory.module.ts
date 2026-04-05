import { DriverType, StorageModule } from '@/libs/storage';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    StorageModule.forRootAsync({
      useFactory: () => ({
        default: 'local',
        disks: {
          local: {
            driver: DriverType.LOCAL,
            config: {
              root: process.cwd(),
            },
          },
        },
      }),
    }),
  ],
})
export class AsyncFactoryModule {}

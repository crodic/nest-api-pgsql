import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import 'dotenv/config';
import { NestLensModule } from 'nestlens';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NestLensModule.forRoot({
      enabled: !!process.env.NEST_LENS_ENABLED,
      storage: {
        driver: 'redis',
        memory: { maxEntries: 100000 },
        redis: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
      },
      watchers: {
        request: {
          enabled: true,
        },
        query: {
          enabled: true,
        },
        mail: {
          enabled: true,
        },
        cache: {
          enabled: true,
        },
        command: {
          enabled: true,
        },
        schedule: {
          enabled: true
        }
      },
    }),
  ],
})
export class MonitoringModule {}

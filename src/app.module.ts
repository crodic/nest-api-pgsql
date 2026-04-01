import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import authConfig from '@/api/auth/config/auth.config';
import appConfig from '@/config/app.config';
import databaseConfig from '@/database/config/database.config';
import mailConfig from '@/mail/config/mail.config';
import redisConfig from '@/redis/config/redis.config';
import storageConfig from '@/storage/storage.config';

import { TypeOrmConfigService } from '@/database/typeorm-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import expressBasicAuth from 'express-basic-auth';

import { CacheModule } from '@nestjs/cache-manager';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';

import { ApiModule } from '@/api/api.module';
import { BackgroundModule } from '@/background/background.module';
import { LibsModule } from '@/libs/libs.module';
import { MailModule } from '@/mail/mail.module';
import { SharedModule } from '@/shared/shared.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { SentryModule } from '@sentry/nestjs/setup';
import { ClsModule } from 'nestjs-cls';
import { NestLensModule } from 'nestlens';

import { AllConfigType } from '@/config/config.type';
import { Environment } from '@/constants/app.constant';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import path, { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

import loggerFactory from './utils/logger-factory';

@Module({
  imports: [
    // -----------------
    // GLOBAL CONFIG
    // -----------------
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        authConfig,
        mailConfig,
        storageConfig,
      ],
      envFilePath: ['.env'],
    }),

    // -----------------
    // TYPEORM
    // -----------------
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        if (!options) throw new Error('Invalid options passed');
        return new DataSource(options).initialize();
      },
    }),

    // -----------------
    // BULLMQ
    // -----------------
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<AllConfigType>) => ({
        connection: {
          host: config.getOrThrow('redis.host', { infer: true }),
          port: config.getOrThrow('redis.port', { infer: true }),
          password: config.getOrThrow('redis.password', { infer: true }),
          tls: config.get('redis.tlsEnabled', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),

    BullBoardModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AllConfigType>) => ({
        route: config.getOrThrow('app.bullBoardPath', { infer: true }),
        adapter: ExpressAdapter,
        middleware: expressBasicAuth({
          users: {
            [config.getOrThrow('auth.bullBoardUsername', { infer: true })]:
              config.getOrThrow('auth.bullBoardPassword', { infer: true }),
          },
          challenge: true,
        }),
      }),
    }),

    // -----------------
    // I18N
    // -----------------
    I18nModule.forRootAsync({
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      useFactory: (config: ConfigService<AllConfigType>) => {
        const env = config.get('app.nodeEnv', { infer: true });
        const isLocal = env === Environment.LOCAL;
        const isDev = env === Environment.DEVELOPMENT;

        return {
          fallbackLanguage: config.getOrThrow('app.fallbackLanguage', {
            infer: true,
          }),
          loaderOptions: {
            path: path.join(__dirname, './i18n/'),
            watch: isLocal,
          },
          typesOutputPath: path.join(
            __dirname,
            '../src/generated/i18n.generated.ts',
          ),
          logging: isLocal || isDev,
        };
      },
      inject: [ConfigService],
    }),

    // -----------------
    // LOGGER
    // -----------------
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: loggerFactory,
    }),

    // -----------------
    // CACHE
    // -----------------
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<AllConfigType>) => {
        const host = config.getOrThrow('redis.host', { infer: true });
        const port = config.getOrThrow('redis.port', { infer: true });
        const password = config.getOrThrow('redis.password', { infer: true });

        const uri = `redis://${password}@${host}:${port}`;

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(uri),
          ],
        };
      },
      isGlobal: true,
      inject: [ConfigService],
    }),

    // -----------------
    // STATIC FILES
    // -----------------
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => [
        {
          rootPath: join(process.cwd(), 'storage', 'public'),
          serveRoot: '/storage/public',
        },
        {
          rootPath: join(process.cwd(), 'public'),
          serveRoot: '/public',
        },
        {
          rootPath: join(process.cwd(), 'storage', 'avatars'),
          serveRoot: '/storage/avatars',
        },
      ],
    }),

    // -----------------
    // CLS
    // -----------------
    ClsModule.forRoot({
      middleware: { mount: true },
      global: true,
    }),

    // -----------------
    // MONITORING (NestLens)
    // -----------------
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
    }),

    // -----------------
    // SENTRY
    // -----------------
    SentryModule.forRoot(),

    // -----------------
    // APPLICATION MODULES
    // -----------------
    LibsModule,
    BackgroundModule,
    MailModule,
    ApiModule,
    SharedModule,
  ],
})
export class AppModule {}

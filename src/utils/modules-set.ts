import { ApiModule } from '@/api/api.module';
import authConfig from '@/api/auth/config/auth.config';
import { BackgroundModule } from '@/background/background.module';
import appConfig from '@/config/app.config';
import { AllConfigType } from '@/config/config.type';
import { Environment } from '@/constants/app.constant';
import databaseConfig from '@/database/config/database.config';
import { TypeOrmConfigService } from '@/database/typeorm-config.service';
import { LibsModule } from '@/libs/libs.module';
import mailConfig from '@/mail/config/mail.config';
import { MailWatcherModule } from '@/mail/mail-watcher.module';
import { MailModule } from '@/mail/mail.module';
import redisConfig from '@/redis/config/redis.config';
import { SharedModule } from '@/shared/shared.module';
import storageConfig from '@/storage/storage.config';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import { CacheableMemory } from 'cacheable';
import 'dotenv/config';
import { Request } from 'express';
import expressBasicAuth from 'express-basic-auth';
import { ClsModule } from 'nestjs-cls';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
import { NestLensModule } from 'nestlens';
import path, { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import loggerFactory from './logger-factory';

function generateModulesSet() {
  const imports: ModuleMetadata['imports'] = [
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
  ];
  let customModules: ModuleMetadata['imports'] = [];

  // Database Module
  const dbModule = TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options: DataSourceOptions) => {
      if (!options) {
        throw new Error('Invalid options passed');
      }

      return new DataSource(options).initialize();
    },
  });

  // Background Jobs Module
  const bullModule = BullModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService<AllConfigType>) => {
      return {
        connection: {
          host: configService.getOrThrow('redis.host', {
            infer: true,
          }),
          port: configService.getOrThrow('redis.port', {
            infer: true,
          }),
          password: configService.getOrThrow('redis.password', {
            infer: true,
          }),
          tls: configService.get('redis.tlsEnabled', { infer: true }),
        },
      };
    },
    inject: [ConfigService],
  });

  // Background Jobs Dashboard
  const bullBoardModule = BullBoardModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService<AllConfigType>) => {
      return {
        route: configService.getOrThrow('app.bullBoardPath', { infer: true }),
        adapter: ExpressAdapter,
        middleware: expressBasicAuth({
          users: {
            [configService.getOrThrow('auth.bullBoardUsername', {
              infer: true,
            })]: configService.getOrThrow('auth.bullBoardPassword', {
              infer: true,
            }),
          },
          challenge: true,
        }),
      };
    },
  });

  // Localization Module
  const i18nModule = I18nModule.forRootAsync({
    resolvers: [
      { use: QueryResolver, options: ['lang'] },
      AcceptLanguageResolver,
      new HeaderResolver(['x-lang']),
    ],
    useFactory: (configService: ConfigService<AllConfigType>) => {
      const env = configService.get('app.nodeEnv', { infer: true });
      const isLocal = env === Environment.LOCAL;
      const isDevelopment = env === Environment.DEVELOPMENT;
      return {
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: {
          path: path.join(__dirname, '/../i18n/'),
          watch: isLocal,
        },
        typesOutputPath: path.join(
          __dirname,
          '../../src/generated/i18n.generated.ts',
        ),
        logging: isLocal || isDevelopment, // log info on missing keys
      };
    },
    inject: [ConfigService],
  });

  // Logger Module
  const loggerModule = LoggerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: loggerFactory,
  });

  const keyvCacheModule = CacheModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService<AllConfigType>) => {
      const redisHost = configService.getOrThrow('redis.host', {
        infer: true,
      });
      const redisPort = configService.getOrThrow('redis.port', {
        infer: true,
      });
      const redisPassword = configService.getOrThrow('redis.password', {
        infer: true,
      });
      const redisTls = configService.get('redis.tlsEnabled', { infer: true });

      const redisUri = `redis://${redisPassword}@${redisHost}:${redisPort}`;

      return {
        stores: [
          new Keyv({
            store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
          }),
          new KeyvRedis(redisUri),
        ],
      };
    },
    isGlobal: true,
    inject: [ConfigService],
  });

  // Sentry Module
  const sentryModule = SentryModule.forRoot();

  // Csl Module
  const clsModule = ClsModule.forRoot({
    middleware: { mount: true },
    global: true,
  });

  // Serve Static Module
  const serveStaticModule = ServeStaticModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: () => {
      return [
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
      ];
    },
  });

  // Monitoring Module
  const monitoringModule = NestLensModule.forRoot({
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
      mail: true,
    },
    authorization: {
      canAccess: (req: Request) => {
        const authHeader = req.headers.authorization;
        const send401 = () => {
          req.res?.setHeader('WWW-Authenticate', 'Basic realm="NestLens"');
          req.res?.status(401).end();
        };

        if (!authHeader) {
          send401();
          return false;
        }

        const [type, encoded] = authHeader.split(' ');
        if (type !== 'Basic' || !encoded) {
          send401();
          return false;
        }

        const decoded = Buffer.from(encoded, 'base64').toString();
        const [username, password] = decoded.split(':');

        const usernameConfig = process.env.NEST_LENS_USERNAME || 'nestlens';
        const passwordConfig = process.env.NEST_LENS_PASSWORD || 'admin@2026';

        const isValid =
          username === usernameConfig && password === passwordConfig;

        if (!isValid) {
          send401();
          return false;
        }

        return true;
      },
    },
  });

  const modulesSet = process.env.MODULES_SET || 'monolith';

  switch (modulesSet) {
    case 'monolith':
      customModules = [
        monitoringModule,
        serveStaticModule,
        sentryModule,
        dbModule,
        keyvCacheModule,
        bullModule,
        bullBoardModule,
        i18nModule,
        loggerModule,
        clsModule,
        LibsModule,
        BackgroundModule,
        MailModule,
        MailWatcherModule,
        ApiModule,
        SharedModule,
      ];
      break;
    default:
      console.error(`Unsupported modules set: ${modulesSet}`);
      break;
  }

  return imports.concat(customModules);
}

export default generateModulesSet;

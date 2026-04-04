/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';

process.env.APP_NAME = 'NestJS API';
process.env.APP_URL = 'http://localhost:8000';
process.env.APP_PORT = '8000';
process.env.APP_DEBUG = 'false';
process.env.API_PREFIX = 'api';
process.env.APP_FALLBACK_LANGUAGE = 'en';
process.env.APP_LOG_LEVEL = 'debug';
process.env.APP_LOG_SERVICE = 'console';
process.env.APP_CORS_ORIGIN = 'http://localhost:5173,http://localhost:3000';
process.env.APP_SECURE_HEADER_ORIGIN =
  'http://localhost:3000,http://localhost:5173';

process.env.DATABASE_TYPE = 'postgres';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_USERNAME = 'postgres';
process.env.DATABASE_PASSWORD = 'postgres';
process.env.DATABASE_NAME = 'boilerplate';
process.env.DATABASE_LOGGING = 'true';
process.env.DATABASE_SYNC = 'false';
process.env.DATABASE_SYNCHRONIZE = 'false';
process.env.DATABASE_MAX_CONNECTIONS = '100';
process.env.DATABASE_SSL_ENABLED = 'false';
process.env.DATABASE_REJECT_UNAUTHORIZED = 'false';
process.env.DATABASE_CA = '';
process.env.DATABASE_KEY = '';
process.env.DATABASE_CERT = '';

process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.REDIS_TLS_ENABLED = 'false';

process.env.MAIL_HOST = 'localhost';
process.env.MAIL_PORT = '1025';
process.env.MAIL_USER = '';
process.env.MAIL_PASSWORD = '';
process.env.MAIL_IGNORE_TLS = 'true';
process.env.MAIL_SECURE = 'false';
process.env.MAIL_REQUIRE_TLS = 'false';
process.env.MAIL_DEFAULT_EMAIL = 'noreply@example.com';
process.env.MAIL_DEFAULT_NAME = 'No Reply';
process.env.MAIL_CLIENT_PORT = '1080';

process.env.AUTH_JWT_SECRET = 'VbKmnvzh2sFjHMsKQmJLNNueenshyczC';
process.env.AUTH_JWT_TOKEN_EXPIRES_IN = '1d';
process.env.AUTH_REFRESH_SECRET = '1xuMcULk0LyLskEAdDRUmJVuu2XeXsZE';
process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN = '365d';
process.env.AUTH_FORGOT_SECRET = '3Cu0lfKUI7HqU48NEtbLabvMDobjjTdp';
process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN = '15m';
process.env.AUTH_CONFIRM_EMAIL_SECRET = 'iNjzY4JGQR8vm4xRe0r2FPmanFkKyNEy';
process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN = '1d';

process.env.USER_AUTH_JWT_SECRET = 'n97GlWkRxdw7sr09GhlczYrS65A5FZVN';
process.env.USER_AUTH_JWT_TOKEN_EXPIRES_IN = '2m';
process.env.USER_AUTH_REFRESH_SECRET = 'zebZfLOgk6pJc8X4APrWg184x3ACYCOd';
process.env.USER_AUTH_REFRESH_TOKEN_EXPIRES_IN = '365d';
process.env.USER_AUTH_FORGOT_SECRET = 'BwOCLkBbESM423gfso2asfeiEYJs13lY';
process.env.USER_AUTH_FORGOT_TOKEN_EXPIRES_IN = '7d';
process.env.USER_AUTH_CONFIRM_EMAIL_SECRET = '95q3rojzddUScpw1Uv6muFt0g1e4rgZv';
process.env.USER_AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN = '1d';

process.env.AUTH_PORTAL_RESET_PASSWORD_URL =
  'http://localhost:5173/reset-password';
process.env.AUTH_CLIENT_RESET_PASSWORD_URL =
  'http://localhost:3000/reset-password';

process.env.GOOGLE_CLIENT_ID = '';
process.env.GOOGLE_CLIENT_SECRET = '';

process.env.SENTRY_DNS_NESTJS =
  'https://44dfd6112ea0039738d145b8984466de@o4510608915628032.ingest.us.sentry.io/4510802160386048';
process.env.SENTRY_ENVIRONMENT = 'local';

process.env.SWAGGER_USERNAME = 'swagger';
process.env.SWAGGER_PASSWORD = 'admin@2026';

process.env.NEST_LENS_ENABLED = 'true';

process.env.BULL_BOARD_PATH = '/queues';
process.env.BULL_BOARD_USERNAME = 'bullboard';
process.env.BULL_BOARD_PASSWORD = 'admin@2026';

process.env.FILESYSTEM_DISK = 'public';

process.env.AWS_REGION = 'ap-southeast-1';
process.env.AWS_BUCKET = 'my-bucket';
process.env.AWS_ENDPOINT = 'https://s3.ap-southeast-1.amazonaws.com';
process.env.AWS_ACCESS_KEY_ID = 'xxx';
process.env.AWS_SECRET_ACCESS_KEY = 'yyy';

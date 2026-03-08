import { IsMs } from '@/decorators/validators/is-ms.decorator';
import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { AuthConfig } from './auth-config.type';

class EnvironmentVariablesValidator {
  // GUARD ADMIN
  @IsString()
  @IsNotEmpty()
  AUTH_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  AUTH_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  AUTH_FORGOT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_FORGOT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  AUTH_CONFIRM_EMAIL_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  AUTH_PORTAL_RESET_PASSWORD_URL: string;

  // GUARD USER
  @IsString()
  @IsNotEmpty()
  USER_AUTH_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  USER_AUTH_JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  USER_AUTH_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  USER_AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  USER_AUTH_FORGOT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  USER_AUTH_FORGOT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  USER_AUTH_CONFIRM_EMAIL_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  USER_AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  AUTH_CLIENT_RESET_PASSWORD_URL: string;

  @IsString()
  @IsOptional()
  SWAGGER_USERNAME: string;

  @IsString()
  @IsOptional()
  SWAGGER_PASSWORD: string;

  @IsString()
  @IsOptional()
  NEST_LENS_USERNAME: string;

  @IsString()
  @IsOptional()
  NEST_LENS_PASSWORD: string;

  @IsString()
  @IsOptional()
  BULL_BOARD_USERNAME: string;

  @IsString()
  @IsOptional()
  BULL_BOARD_PASSWORD: string;
}

export default registerAs<AuthConfig>('auth', () => {
  console.info(`Register AuthConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    // GUARD ADMIN
    secret: process.env.AUTH_JWT_SECRET,
    expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
    refreshSecret: process.env.AUTH_REFRESH_SECRET,
    refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
    forgotSecret: process.env.AUTH_FORGOT_SECRET,
    forgotExpires: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN,
    confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
    confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
    portalResetPasswordUrl: process.env.AUTH_PORTAL_RESET_PASSWORD_URL,

    // GUARD USER
    userSecret: process.env.USER_AUTH_JWT_SECRET,
    userExpires: process.env.USER_AUTH_JWT_TOKEN_EXPIRES_IN,
    userRefreshSecret: process.env.USER_AUTH_REFRESH_SECRET,
    userRefreshExpires: process.env.USER_AUTH_REFRESH_TOKEN_EXPIRES_IN,
    userForgotSecret: process.env.USER_AUTH_FORGOT_SECRET,
    userForgotExpires: process.env.USER_AUTH_FORGOT_TOKEN_EXPIRES_IN,
    userConfirmEmailSecret: process.env.USER_AUTH_CONFIRM_EMAIL_SECRET,
    userConfirmEmailExpires:
      process.env.USER_AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
    clientResetPasswordUrl: process.env.USER_AUTH_CLIENT_RESET_PASSWORD_URL,

    // Basic Auth
    swaggerUsername: process.env.SWAGGER_USERNAME || 'swagger',
    swaggerPassword: process.env.SWAGGER_PASSWORD || 'admin@2026',
    nestLensUsername: process.env.NEST_LENS_USERNAME || 'nestlens',
    nestLensPassword: process.env.NEST_LENS_PASSWORD || 'admin@2026',
    bullBoardUsername: process.env.BULL_BOARD_USERNAME || 'bullboard',
    bullBoardPassword: process.env.BULL_BOARD_PASSWORD || 'admin@2026',
  };
});

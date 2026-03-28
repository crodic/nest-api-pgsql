import { avatarUploadOption } from '@/api/admin-user/configs/multer.config';
import { AdminUserResDto } from '@/api/admin-user/dto/admin-user.res.dto';
import { ChangePasswordReqDto } from '@/api/admin-user/dto/change-password.req.dto';
import { ChangePasswordResDto } from '@/api/admin-user/dto/change-password.res.dto';
import { UpdateMeReqDto } from '@/api/admin-user/dto/update-me.req.dto';
import { ID } from '@/common/types/common.type';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '@/decorators/http.decorators';
import { AdminAuthGuard } from '@/guards/admin-auth.guard';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AdminUserLoginReqDto } from '../dto/admin-users/admin-user-login.req.dto';
import { AdminUserLoginResDto } from '../dto/admin-users/admin-user-login.res.dto';
import { AdminUserRegisterReqDto } from '../dto/admin-users/admin-user-register.req.dto';
import { ForgotPasswordReqDto } from '../dto/forgot-password.req.dto';
import { ForgotPasswordResDto } from '../dto/forgot-password.res.dto';
import { RefreshReqDto } from '../dto/refresh.req.dto';
import { RefreshResDto } from '../dto/refresh.res.dto';
import { RegisterResDto } from '../dto/register.res.dto';
import { ResendEmailVerifyReqDto } from '../dto/resend-email-verify.req.dto';
import { ResendEmailVerifyResDto } from '../dto/resend-email-verify.res.dto';
import { ResetPasswordReqDto } from '../dto/reset-password.req.dto';
import { ResetPasswordResDto } from '../dto/reset-password.res.dto';
import { ProdOnlyThrottleGuard } from '../guards/ProdOnlyThrottle.guard';
import { AdminAuthService } from '../services/admin-auth.service';
import { JwtPayloadType } from '../types/jwt-payload.type';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
@UseGuards(AdminAuthGuard, ProdOnlyThrottleGuard)
export class AdminAuthenticationController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiPublic({
    type: AdminUserLoginResDto,
    summary: 'Admin Login API',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() adminUserLogin: AdminUserLoginReqDto,
  ): Promise<AdminUserLoginResDto> {
    return await this.adminAuthService.login(adminUserLogin);
  }

  @ApiPublic({
    type: RegisterResDto,
    summary: 'Admin Register API',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() dto: AdminUserRegisterReqDto,
  ): Promise<RegisterResDto> {
    return await this.adminAuthService.register(dto);
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token',
  })
  @SkipThrottle()
  @Post('refresh')
  async refresh(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return await this.adminAuthService.refreshToken(dto);
  }

  @ApiAuth({
    summary: 'Logout for portal',
    errorResponses: [304, 500, 401, 403],
  })
  @SkipThrottle()
  @Post('logout')
  async logout(@CurrentUser() userToken: JwtPayloadType): Promise<void> {
    await this.adminAuthService.logout(userToken);
  }

  @ApiPublic({
    type: ForgotPasswordResDto,
    summary: 'Forgot password',
  })
  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async forgotPassword(
    @Body() dto: ForgotPasswordReqDto,
  ): Promise<ForgotPasswordResDto> {
    return await this.adminAuthService.forgotPassword(dto);
  }

  @ApiPublic({ summary: 'Verify account' })
  @ApiQuery({ name: 'token', type: 'string' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('verify')
  async verifyAccount(@Query('token') token: string) {
    return await this.adminAuthService.verifyAccount(token);
  }

  @ApiPublic({
    type: ResendEmailVerifyResDto,
    summary: 'Resend verify email',
  })
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Post('verify/resend')
  async resendVerifyEmail(
    @Body() dto: ResendEmailVerifyReqDto,
  ): Promise<ResendEmailVerifyResDto> {
    return this.adminAuthService.resendVerifyEmail(dto);
  }

  @ApiPublic({ type: ResetPasswordResDto, summary: 'Reset password' })
  @ApiQuery({ name: 'token', type: 'string' })
  @SkipThrottle()
  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() dto: ResetPasswordReqDto,
  ): Promise<ResetPasswordResDto> {
    return this.adminAuthService.resetPassword(token, dto);
  }

  @ApiAuth({
    type: AdminUserResDto,
    summary: 'Get current user',
  })
  @SkipThrottle()
  @Get('me')
  async me(@CurrentUser('id') userId: ID): Promise<AdminUserResDto> {
    return await this.adminAuthService.me(userId);
  }

  @ApiConsumes('multipart/form-data')
  @ApiAuth({
    type: AdminUserResDto,
    summary: 'Update current user',
  })
  @SkipThrottle()
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOption))
  @Put('me')
  async updateMe(
    @CurrentUser('id') userId: ID,
    @Body() reqDto: UpdateMeReqDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(png|webp|jpeg)$/,
            skipMagicNumbersValidation: true,
            errorMessage: 'Invalid file type',
          }),
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
            errorMessage: 'File too large',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ): Promise<{ message: string }> {
    return await this.adminAuthService.updateMe(userId, reqDto, image);
  }

  @ApiAuth({
    type: ChangePasswordResDto,
    summary: 'Change password',
    errorResponses: [400, 401, 403, 404, 500],
  })
  @SkipThrottle()
  @Post('me/change-password')
  async changePassword(
    @CurrentUser('id') userId: ID,
    @Body() reqDto: ChangePasswordReqDto,
  ): Promise<ChangePasswordResDto> {
    return this.adminAuthService.changePassword(userId, reqDto);
  }
}

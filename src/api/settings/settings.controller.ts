import { ApiPublic } from '@/decorators/http.decorators';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SettingKeyValidationPipe } from 'src/pipes/setting-key-validation.pipe';
import { websiteUploadOptions } from './configs/multer.config';
import { UpdateWebsiteSettingReqDto } from './dto/update-website-setting.req.dto';
import { WebsiteSettingResDto } from './dto/website-setting.res.dto';
import { SettingsService } from './settings.service';
import { ValidSettingKey } from './validations/valid-setting-key.validate';

@ApiTags('Settings')
@Controller({
  path: 'settings',
  version: '1',
})
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  async getSettingByKey(
    @Param('key', SettingKeyValidationPipe) key: string,
  ): Promise<WebsiteSettingResDto> {
    if (!ValidSettingKey.isValid(key)) {
      throw new NotFoundException('Invalid key');
    }

    const setting = await this.settingsService.get<WebsiteSettingResDto>(
      key,
      {},
    );

    return plainToInstance(WebsiteSettingResDto, setting, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':key')
  @ApiConsumes('multipart/form-data')
  @ApiPublic({
    summary: 'Update website settings',
    type: WebsiteSettingResDto,
  })
  @ApiBody({
    description: 'Upload a logo and favicon',
    schema: {
      type: 'object',
      properties: {
        site_logo: {
          type: 'string',
          format: 'binary',
        },
        site_favicon: {
          type: 'string',
          format: 'binary',
        },
        site_title: {
          type: 'string',
        },
        site_tagline: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'site_logo', maxCount: 1 },
        { name: 'site_favicon', maxCount: 1 },
      ],
      websiteUploadOptions,
    ),
  )
  async updateWebsiteSetting(
    @Param('key', SettingKeyValidationPipe) key: string,
    @Body() dto: UpdateWebsiteSettingReqDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(png|webp)$/ }),
        ],
      }),
    )
    files: {
      site_logo?: Express.Multer.File[];
      site_favicon?: Express.Multer.File[];
    },
  ) {
    if (!ValidSettingKey.isValid(key)) {
      throw new NotFoundException('Invalid key');
    }

    const setting = await this.settingsService.get<WebsiteSettingResDto>(
      key,
      {},
    );

    const payload = {
      ...dto,
      site_logo: files.site_logo?.[0].path ?? setting.site_logo,
      site_favicon: files.site_favicon?.[0].path ?? setting.site_favicon,
    };

    const newSetting = { ...setting, ...payload };
    await this.settingsService.set(key, newSetting);

    return plainToInstance(WebsiteSettingResDto, newSetting, {
      excludeExtraneousValues: true,
    });
  }
}

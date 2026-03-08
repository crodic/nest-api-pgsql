import { StringFieldOptional } from '@/decorators/field.decorators';

export class UpdateWebsiteSettingReqDto {
  @StringFieldOptional()
  site_title?: string;

  @StringFieldOptional()
  site_tagline?: string;
}

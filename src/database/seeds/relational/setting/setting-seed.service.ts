import { SettingEntity } from '@/api/settings/entities/setting.entity';
import { SettingKeys } from '@/api/settings/enums/setting-keys';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const appSetting = {
  key: SettingKeys.APP_SETTINGS,
  value: {
    site_logo: 'https://i.ibb.co/7YQgZrG/Logo.png',
    site_favicon: 'https://i.ibb.co/7YQgZrG/Logo.png',
    site_title: 'Nest Boilerplate',
    site_tagline: 'Nest Boilerplate',
  },
};

@Injectable()
export class SettingSeedService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {}

  async run(): Promise<void> {
    const existingSetting = await this.settingRepository.findOne({
      where: { key: appSetting.key },
    });

    if (existingSetting) {
      existingSetting.value = appSetting.value;
      await this.settingRepository.save(existingSetting);
      return;
    }

    await this.settingRepository.save(
      this.settingRepository.create(appSetting),
    );
  }
}

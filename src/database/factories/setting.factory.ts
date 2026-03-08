import { SettingEntity } from '@/api/settings/entities/setting.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(SettingEntity, () => {
  const appSetting = new SettingEntity();

  appSetting.key = 'APP_SETTING_KEY';
  appSetting.value = {
    site_logo: 'https://i.ibb.co/7YQgZrG/Logo.png',
    site_favicon: 'https://i.ibb.co/7YQgZrG/Logo.png',
    site_title: 'Nest Boilerplate',
    site_tagline: 'Nest Boilerplate',
  };

  return appSetting;
});

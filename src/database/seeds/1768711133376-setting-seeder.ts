import { SettingEntity } from '@/api/settings/entities/setting.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class SettingSeeder1768711133376 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const settingFactory = factoryManager.get(SettingEntity);
    await settingFactory.saveMany(1);
  }
}

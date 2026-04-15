import { Global, Module } from '@nestjs/common';
import { CaslModule } from './casl/casl.module';
import { MonitoringModule } from './nestlens/monitoring.module';

@Global()
@Module({
  imports: [CaslModule, MonitoringModule],
  exports: [CaslModule],
})
export class LibsModule {}

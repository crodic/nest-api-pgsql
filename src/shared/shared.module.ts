import { Global, Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';

@Global()
@Module({
  imports: [],
  providers: [StorageService],
  exports: [StorageService],
})
export class SharedModule {}

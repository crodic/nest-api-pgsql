import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogSubscriber } from './subscribers/audit-log.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [AuditLogSubscriber, AuditLogService],
  controllers: [AuditLogController],
})
export class AuditLogModule {}

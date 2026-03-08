import { SessionEntity } from '@/api/auth/entities/session.entity';
import { Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditLogSubscriber.name);

  constructor(
    private dataSource: DataSource,
    private cls: ClsService<{ userId?: string }>,
  ) {
    this.dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<any>) {
    await this.saveLog('INSERT', event);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    await this.saveLog('UPDATE', event);
  }

  async afterRemove(event: RemoveEvent<any>) {
    await this.saveLog('DELETE', event);
  }

  async afterSoftRemove(event: SoftRemoveEvent<any>) {
    await this.saveLog('DELETE', event);
  }

  private async saveLog(action: 'INSERT' | 'UPDATE' | 'DELETE', event: any) {
    if (
      event.metadata.name === AuditLogEntity.name ||
      event.metadata.name === SessionEntity.name
    )
      return;

    const auditRepo = event.manager.getRepository(AuditLogEntity);
    const userId = this.cls.get('userId');
    const userType = this.cls.get('userType');

    const log = auditRepo.create({
      entity: event.metadata.name,
      entityId: event.entity?.id ?? event.databaseEntity?.id ?? event.entityId,
      action,
      oldValue: event.databaseEntity ?? null,
      newValue: event.entity ?? null,
      userId,
      userType,
    });

    await auditRepo.save(log);
  }
}

import { SessionEntity } from '@/api/auth/entities/session.entity';
import { Logger } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RecoverEvent,
  RemoveEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditLogSubscriber.name);
  private readonly ignoreEntities = [AuditLogEntity.name, SessionEntity.name];

  constructor(private dataSource: DataSource) {
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
    await this.saveLog('SOFT_DELETE', event);
  }

  async afterRecover(event: RecoverEvent<any>) {
    await this.saveLog('RESTORE', event);
  }

  private async saveLog(
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'SOFT_DELETE',
    event: any,
  ) {
    if (
      !event.entity ||
      !event.entityId ||
      this.ignoreEntities.includes(event.metadata.name)
    )
      return;

    const excludeFields = ['password'];
    const cls = ClsServiceManager.getClsService();

    const auditRepo = event.manager.getRepository(AuditLogEntity);
    const currentUser = cls.get('user') ?? {};
    const userId = currentUser?.id;

    const oldValue = {};
    const newValue = {};
    for (const key in event.entity) {
      if (excludeFields.includes(key)) continue;
      oldValue[key] = event.databaseEntity?.[key];
      newValue[key] = event.entity?.[key];
    }

    const userType = cls.get('userType') || 'GuestEntity';

    const log = auditRepo.create({
      entity: event.metadata.name,
      entityId: event.entity?.id ?? event.databaseEntity?.id ?? event.entityId,
      action,
      oldValue,
      newValue,
      userId: userId ?? null,
      ip: cls.get('ip'),
      userAgent: cls.get('userAgent'),
      requestId: cls.get('requestId'),
      timestamp: new Date(),
      metadata: {
        actorId: userId ?? null,
        role: currentUser?.role?.name ?? null,
        userType,
      },
      description: this.buildDescription(
        action,
        `${event.metadata.name}:${event.entity?.id ?? event.databaseEntity?.id ?? event.entityId}`,
      ),
    });

    setImmediate(() => auditRepo.save(log));
  }

  private buildDescription = (
    action: string,
    entityType: string,
    metadata?: any,
  ) => {
    switch (action) {
      case 'INSERT':
        return `New ${entityType} created`;
      case 'UPDATE':
        return `Updated ${entityType}`;
      case 'DELETE':
        return `Deleted ${entityType}`;
      case 'RESTORE':
        return `Restored ${entityType}`;
      case 'SOFT_DELETE':
        return `Soft deleted ${entityType}`;
      default:
        return `${action} ${entityType}`;
    }
  };
}

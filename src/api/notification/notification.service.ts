import { ID } from '@/common/types/common.type';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRecipientEntity } from './entities/notification-recipient.entity';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(NotificationRecipientEntity)
    private recipientRepo: Repository<NotificationRecipientEntity>,
    private gateway: NotificationGateway,
  ) {}

  async createNotification(
    actorId: string,
    recipientIds: string[],
    data: Partial<NotificationEntity>,
  ) {
    const notification = this.notificationRepo.create({
      actorId,
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      metadata: data.metadata || null,
    });

    notification.recipients = recipientIds.map((userId) =>
      this.recipientRepo.create({ userId }),
    );

    await this.notificationRepo.save(notification);

    // Gửi real-time qua Socket.IO tới từng user
    for (const userId of recipientIds) {
      this.gateway.sendToUser(userId, notification);
    }

    return notification;
  }

  async markAsRead(notificationId: ID, userId: ID) {
    return this.recipientRepo.update(
      { notificationId, userId },
      { isRead: true },
    );
  }

  async getUserNotifications(userId: ID) {
    return this.recipientRepo.find({
      where: { userId },
      relations: ['notification'],
      order: { createdAt: 'DESC' },
    });
  }
}

import { ID } from '@/common/types/common.type';
import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Get(':userId')
  getNotifications(@Param('userId') userId: ID) {
    return this.service.getUserNotifications(userId);
  }

  @Patch(':notificationId/read/:userId')
  markRead(
    @Param('notificationId') notificationId: ID,
    @Param('userId') userId: ID,
  ) {
    return this.service.markAsRead(notificationId, userId);
  }
}

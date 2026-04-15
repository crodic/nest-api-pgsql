import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRecipientEntity } from './entities/notification-recipient.entity';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, NotificationRecipientEntity]),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}

import { ID } from '@/common/types/common.type';
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  id: ID;
}

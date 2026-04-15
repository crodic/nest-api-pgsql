import { ID } from '@/common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Entity('notification-recipients')
export class NotificationRecipientEntity {
  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_notification_recipient_id',
    type: 'bigint',
  })
  id!: ID;

  @JoinColumn({
    name: 'notification_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_recipient_notification_id',
  })
  @ManyToOne(
    () => NotificationEntity,
    (notification) => notification.recipients,
    {
      onDelete: 'CASCADE',
    },
  )
  notification: Relation<NotificationEntity>;

  @Column({ name: 'notification_id', type: 'bigint' })
  notificationId: ID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: ID;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt: Date;
}

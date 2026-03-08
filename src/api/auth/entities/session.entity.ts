import { ID } from '@/common/types/common.type';
import { ESessionUserType } from '@/constants/entity.enum';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity extends AbstractEntity {
  constructor(data?: Partial<SessionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    primaryKeyConstraintName: 'PK_session_id',
  })
  id!: ID;

  @Column({
    name: 'hash',
    type: 'varchar',
    length: 255,
  })
  hash!: string;

  @Index('IDX_sessions_user_id')
  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: ID;

  @Column({
    type: 'enum',
    enum: ESessionUserType,
    enumName: 'sessions_user_enum',
    nullable: false,
    name: 'user_type',
  })
  userType: ESessionUserType;
}

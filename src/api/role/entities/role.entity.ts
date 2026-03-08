import { AdminUserEntity } from '@/api/admin-user/entities/admin-user.entity';
import { ID } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('roles')
export class RoleEntity extends AbstractEntity {
  constructor(data?: Partial<RoleEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_role_id',
    type: 'bigint',
  })
  id!: ID;

  @Index('UQ_roles_name', { unique: true, where: '"deleted_at" IS NULL' })
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @OneToMany(() => AdminUserEntity, (user) => user.role)
  users: Relation<AdminUserEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt: Date;
}

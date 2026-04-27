import { RoleEntity } from '@/api/role/entities/role.entity';
import { AutoIncrementID } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { hashPassword as hashPass } from '@/utils/password.util';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('admin_users')
export class AdminUserEntity extends AbstractEntity {
  constructor(data?: Partial<AdminUserEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_admin_user_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ length: 100, name: 'first_name', nullable: false })
  firstName!: string;

  @Column({ length: 100, name: 'last_name', nullable: true })
  lastName?: string;

  @Column({
    generatedType: 'STORED',
    asExpression: `first_name || ' ' || last_name`,
    name: 'full_name',
    length: 201,
  })
  fullName!: string;

  @Column()
  @Index('UQ_admin_user_email', { where: '"deleted_at" IS NULL', unique: true })
  email!: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ nullable: true, length: 20 })
  phone?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt: Date;

  @Column({
    name: 'role_id',
    type: 'bigint',
  })
  roleId: AutoIncrementID;

  @ManyToOne(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_admin_user_role',
  })
  role: Relation<RoleEntity>;

  @Column({ type: 'timestamptz', name: 'verified_at', nullable: true })
  verifiedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }
}

import { ID } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medias')
export class MediaEntity extends AbstractEntity {
  constructor(data?: Partial<MediaEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_media_id',
    type: 'bigint',
  })
  id!: ID;

  @Column()
  @Index('UQ_media_public_id', { unique: true })
  public_id!: string;

  @Column({ nullable: true })
  folder: string;

  @Column()
  original_name: string;

  @Column()
  path: string;

  @Column()
  hash: string;

  @Column()
  mime: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  duration: number;

  @Column()
  resource_type: string;

  @Column()
  status: string;

  get url() {
    const ext = this.path.split('.').pop();
    return `${process.env.APP_URL}/api/media/${this.resource_type}/upload/${this.public_id}.${ext}`;
  }
}

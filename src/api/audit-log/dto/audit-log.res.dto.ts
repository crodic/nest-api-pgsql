import {
  ClassField,
  JsonFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuditLogResDto {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  entity: string;

  @StringField()
  @Expose()
  entityId: string;

  @StringField()
  @Expose()
  action: string;

  @JsonFieldOptional()
  @Expose()
  oldValue?: any;

  @JsonFieldOptional()
  @Expose()
  newValue?: any;

  @StringFieldOptional()
  @Expose()
  userId: string;

  @StringFieldOptional()
  @Expose()
  description: string;

  @StringFieldOptional()
  @Expose()
  ip: string;

  @StringFieldOptional()
  @Expose()
  userAgent: string;

  @StringFieldOptional()
  @Expose()
  requestId: string;

  @JsonFieldOptional()
  @Expose()
  metadata?: any;

  @ClassField(() => Date)
  @Expose()
  timestamp: Date;
}

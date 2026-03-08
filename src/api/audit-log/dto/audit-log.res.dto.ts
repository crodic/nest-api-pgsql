import {
  ClassField,
  JsonFieldOptional,
  StringField,
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

  @StringField()
  @Expose()
  userId: string;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;
}

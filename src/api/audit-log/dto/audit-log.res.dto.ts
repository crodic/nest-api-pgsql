import { WrapperType } from '@/common/types/types';
import {
  ClassField,
  ClassFieldOptional,
  JsonFieldOptional,
  StringField,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';
import { LogUserResDto } from './log-user.res.dto';

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

  @ClassFieldOptional(() => LogUserResDto)
  @Expose()
  user: WrapperType<LogUserResDto>;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;
}

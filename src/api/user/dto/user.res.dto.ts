import { ID } from '@/common/types/common.type';
import {
  BooleanField,
  ClassField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserResDto {
  @StringField()
  @Expose()
  id: ID;

  @StringField()
  @Expose()
  firstname: string;

  @StringFieldOptional()
  @Expose()
  lastname?: string;

  @StringField()
  @Expose()
  fullname: string;

  @StringField()
  @Expose()
  email: string;

  @StringFieldOptional()
  @Expose()
  avatar?: string;

  @BooleanField()
  @Transform(({ value }) => !!value)
  @Expose()
  verifiedAt?: boolean;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt: Date;
}

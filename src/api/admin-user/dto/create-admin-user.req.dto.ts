import { AutoIncrementID } from '@/common/types/common.type';
import {
  DateFieldOptional,
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Trim } from '@/decorators/transform.decorators';
import { Transform } from 'class-transformer';

export class CreateAdminUserReqDto {
  @StringField()
  @Trim()
  firstName: string;

  @StringField()
  @Trim()
  lastName: string;

  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @StringFieldOptional()
  bio?: string;

  @StringField()
  roleId!: AutoIncrementID;

  @StringFieldOptional()
  phone?: string;

  @DateFieldOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birthday?: Date;
}

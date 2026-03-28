import { ID } from '@/common/types/common.type';
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
  firstname: string;

  @StringField()
  @Trim()
  lastname: string;

  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @StringFieldOptional()
  bio?: string;

  @StringField()
  roleId!: ID;

  @StringFieldOptional()
  phone?: string;

  @DateFieldOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birthday?: Date;
}

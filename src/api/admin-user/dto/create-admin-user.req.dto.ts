import { ID } from '@/common/types/common.type';
import {
  DateFieldOptional,
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Trim } from '@/decorators/transform.decorators';
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';

export class CreateAdminUserReqDto {
  @StringFieldOptional()
  @Transform(lowerCaseTransformer)
  username: string;

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
  roleId!: ID;

  @StringFieldOptional()
  phone?: string;

  @DateFieldOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birthday?: Date;
}

import { AutoIncrementID } from '@/common/types/common.type';
import {
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class AdminUserRegisterReqDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;

  @StringField()
  roleId!: AutoIncrementID;

  @StringFieldOptional()
  username?: string;

  @StringField()
  first_name!: string;

  @StringField()
  last_name!: string;
}

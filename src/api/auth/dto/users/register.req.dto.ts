import { ID } from '@/common/types/common.type';
import {
  ClassField,
  EmailField,
  PasswordField,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class RegisterReqDto {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;

  @ClassField(() => String)
  roleId!: ID;

  @StringFieldOptional()
  username?: string;
}

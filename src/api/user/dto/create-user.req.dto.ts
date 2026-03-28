import {
  EmailField,
  PasswordField,
  StringField,
} from '@/decorators/field.decorators';
import { Trim } from '@/decorators/transform.decorators';

export class CreateUserReqDto {
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

  @PasswordField()
  confirmPassword: string;
}

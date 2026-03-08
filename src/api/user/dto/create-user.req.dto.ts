import {
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Trim } from '@/decorators/transform.decorators';
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';

export class CreateUserReqDto {
  @StringField()
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

  @StringFieldOptional()
  image?: string;
}

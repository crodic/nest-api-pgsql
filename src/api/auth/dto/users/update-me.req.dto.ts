import {
  DateFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Trim } from '@/decorators/transform.decorators';
import { Transform } from 'class-transformer';

export class UpdateAuthUserMeReqDto {
  @StringField()
  @Trim()
  firstName: string;

  @StringField()
  @Trim()
  lastName: string;

  @StringFieldOptional()
  bio?: string;

  @StringFieldOptional()
  phone?: string;

  @DateFieldOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birthday?: Date;
}

import { StringField } from '@/decorators/field.decorators';
import { Trim } from '@/decorators/transform.decorators';

export class UpdateAuthUserMeReqDto {
  @StringField()
  @Trim()
  firstname: string;

  @StringField()
  @Trim()
  lastname: string;
}

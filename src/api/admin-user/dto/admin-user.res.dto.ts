import { RoleResDto } from '@/api/role/dto/role.res.dto';
import { WrapperType } from '@/common/types/types';
import {
  BooleanField,
  ClassField,
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { ToFullUrl } from '@/decorators/transform.decorators';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class AdminUserResDto {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  username: string;

  @StringField()
  @Expose()
  firstName: string;

  @StringField()
  @Expose()
  lastName: string;

  @StringField()
  @Expose()
  fullName: string;

  @StringFieldOptional()
  @Expose()
  phone: string;

  @StringFieldOptional()
  @Expose()
  birthday?: string;

  @StringField()
  @Expose()
  email: string;

  @StringFieldOptional()
  @Expose()
  bio?: string;

  @StringField()
  @ToFullUrl()
  @Expose()
  image: string;

  @ClassFieldOptional(() => RoleResDto)
  @Expose()
  role?: WrapperType<RoleResDto>;

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

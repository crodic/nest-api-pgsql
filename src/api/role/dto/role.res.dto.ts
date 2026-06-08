import {
  ArrayField,
  BooleanField,
  ClassField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class RoleResDto {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  name: string;

  @StringFieldOptional()
  @Expose()
  description?: string;

  @BooleanField()
  @Expose()
  isSystem: boolean;

  @ArrayField(String, { example: ['1', '2'] })
  @Transform(({ obj }) => obj.permissionEntities?.map((item) => item.id) ?? [])
  @Expose()
  permissionIds: string[];

  @ArrayField(String, { example: ['read:USER', 'create:USER'] })
  @Transform(({ obj }) => obj.permissionEntities?.map((item) => item.key) ?? [])
  @Expose()
  permissions: string[];

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt: Date;
}

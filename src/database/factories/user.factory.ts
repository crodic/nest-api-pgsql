import { UserEntity } from '@/api/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(UserEntity, (fake) => {
  const user = new UserEntity();

  const firstName = fake.person.firstName();
  const lastName = fake.person.lastName();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = fake.internet
    .email({ firstName: firstName, lastName: lastName })
    .toLowerCase();
  user.password = '12345678';
  user.avatar = fake.image.avatar();

  return user;
});

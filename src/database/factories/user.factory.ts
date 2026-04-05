import { UserEntity } from '@/api/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(UserEntity, (fake) => {
  const user = new UserEntity();

  const firstname = fake.person.firstName();
  const lastname = fake.person.lastName();
  user.firstname = firstname;
  user.lastname = lastname;
  user.email = fake.internet
    .email({ firstName: firstname, lastName: lastname })
    .toLowerCase();
  user.password = '12345678';
  user.avatar = fake.image.avatar();

  return user;
});

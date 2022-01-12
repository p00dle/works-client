import type { User } from '~/types/user';

import * as faker from '@faker-js/faker/dist/faker.js'
import { randomFromArray } from '~/lib/mock-utils';
import { userRoles } from '~/types/user';
import { v4 as uuid } from '@lukeed/uuid';

export const userMock = (): User => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    username: faker.internet.userName(firstName, lastName),
    fullName: `${firstName} ${lastName}`,
    role: randomFromArray(userRoles),
    uuid: uuid(),
    managerId: faker.internet.userName(),
    email: faker.internet.email(firstName, lastName, 'acme.com'),
    lastLogin: +faker.date.recent(2),
    permissions: {}
  }
};
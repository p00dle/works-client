import { route, routerFactory } from '~/lib/router';

import { Forbidden, InvalidPath } from '~/components/error-pages';
import { useUserData } from '~/queries/user';
import { isAdmin } from '~/access-control';

import { Home } from '~/components/base-views/Home';
import { Upload } from '~/components/admin-tools/Upload';
import { UserManagement } from '~/components/admin-tools/UserManagement';
import { Account } from '~/components/base-views/Account';

export const routes = {
  '/home': route({ name: 'HOME', component: Home }),
  '/upload': route({ name: 'UPLOAD', component: Upload, accessControl: isAdmin}),
  '/user-management': route({ name: 'USER MANAGEMENT', component: UserManagement, accessControl: isAdmin}),
  '/account': route({name: 'ACCOUNT', component: Account })
} as const;

export const { RouterProvider, useRouter } = routerFactory({
  useUserData,
  window,
  routes,
  errorPages: {
    Forbidden,
    InvalidPath,
  },
  homePath: '/home',

});

export type AllRoutes = typeof routes;

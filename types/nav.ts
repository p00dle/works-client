import type { IconName } from '~/components/_common/Icon';
import { Route, Routes } from './router';
import type { UserRole } from './user';


export type NavItem<T extends Routes, R extends keyof T> = {
  name: string;
  icon?: IconName;
  subMenu?: NavItem<T, keyof T>[];
  route?: R;
  routeParams?: T[R] extends Route<infer P> ? P : void;
}



export type NavItemFactory = <T extends Routes>() => (navItem: NavItem<T, keyof T>) => NavItem<T, keyof T>;

export type Navigation<T extends Routes> = Record<UserRole, NavItem<T, keyof T>[]>;
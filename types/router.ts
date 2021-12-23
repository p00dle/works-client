import type React from 'react';
import type { UseQueryResult } from 'react-query';
import type { User } from './user';


export interface Route<T> {
  name: string;
  component: React.FC<T>,
  params?: Partial<Record<keyof T, string>>;
  accessControl?: (user: User, params?: Partial<Record<keyof T, string>>) => boolean;
}

export type Routes = Record<string, Route<any>>;

export type RouterContextState<T extends Routes> = {
  RouteComponent: React.FC;
  route: keyof T;
  routeName: string;
  routeParams: T[keyof T]['params'];
  updateRoute: <R extends keyof T>(route: R, params?: T[R] extends Route<infer P> ? P : never) => void;
  updateRouteParams: (params: Partial<T[keyof T]['params']>) => void;
  stringifyRoute: <R extends keyof T>(route: R, params?: T[R]['params']) => string;
  user: User | null;
}

export type UseRouter<T extends Routes> = () => RouterContextState<T>;

export type RouteFactory = <T>(route: Route<T>) => Route<T>;

export interface WindowType {
  location: {
    href: string;
  }
  history: {
    pushState: (data: any, unused: string, url?: string | URL | null | undefined) => void;
  }
  addEventListener: (eventName: 'popstate', listener: () => void) => void;
}

export type RouterFactoryParams<T extends Record<string, Route<any>>> = {
  useUserData: () => UseQueryResult<any, unknown>;
  window: WindowType;
  routes: T;
  errorPages: {
    Forbidden: React.FC,
    InvalidPath: React.FC,
  };
  homePath?: keyof T;
}

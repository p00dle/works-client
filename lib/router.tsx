import type { RouteFactory, RouterFactoryParams, Routes, RouterContextState, UseRouter } from '~/types/router';

import React, { useReducer, useEffect, createContext, useContext } from 'react';
import type { User } from '~/types/user';

export const route: RouteFactory = id => id;

const EmptyComponent: React.FC = function EmptyComponent(){
  return <div />;
}

function decomposeRoute<T extends Routes>(routes: T, path: string): [keyof T, T[keyof T]['params']] {
  const decodedPath = decodeURI(path);
  const params = {};
  const [fullRoute, paramsStr] = decodedPath.split('?');
  const route = fullRoute.replace(/^https?:\/\/[^\/]+/, '') as keyof T;
  const routeData = routes[route];
  const routeParams: Record<string, string> = {};
  if (routeData && routeData.params) {
    const routeParamNames = Object.keys(routeData);
    paramsStr.split('&').filter(str => str !== '').forEach(str => {
      if (!/=/.test(str)) return;
      const [key, val] = str.split('=');
      if (routeParamNames.includes(key)) routeParams[key] = decodeURIComponent(val);
    });
  }
  return [route, routeParams];
}

function composeRoute<T extends Routes, R extends keyof T>(routes: T, route: R, params: T[R]['params']): string {
  let routeStr = route as string;
  const routeData = routes[route];
  if (!routeData || !routeData.params || !params) return routeStr;
  const paramStr = Object.keys(routeData.params).map(key => `${key}=${encodeURIComponent((params as Record<string,string>)[key])}`).join('&');
  return routeStr + '?' + paramStr;
}

function selectComponent<T extends Routes, R extends keyof T>(routes: T, errorPages: RouterFactoryParams<T>['errorPages'], route: R, params: T[R]['params'], user: User | null): [string, React.FC] {
  if (user === null) return ['', EmptyComponent];
  const routeData = routes[route];
  if (!routeData) return ['INVALID PATH', errorPages.InvalidPath];
  if (routeData.accessControl && !routeData.accessControl(user, params)) return ['FORBIDDEN', errorPages.Forbidden];
  return [routeData.name, routeData.component];
  
}

type RouterReducerAction = 
  | { type: 'update-route', payload: {route: string, params?: Record<string, string>} }
  | { type: 'update-params', payload: {params: Record<string, string>}}
  | { type: 'update-user', payload: {user: User | null}}
  | { type: 'update-functions', payload: {
      updateRoute: (route: string, params?: Record<string, string>) => void;
      updateRouteParams: (params: Record<string, string>) => void,
      stringifyRoute: (route: string, params?: Record<string, string>) => string;
    }}
  | { type: 'on-popstate'}
;

export const routerFactory = <T extends Routes>({window, routes, errorPages, homePath, useUserData}: RouterFactoryParams<T>): { RouterProvider: React.FC, useRouter: UseRouter<T> } => {
  const defaultParams: Record<string, string> = {};
  const routeParamArrMap = {} as Record<keyof T, string[]>;
  for (const [route, routeData] of Object.entries(routes)) {
    const params = routeData.params;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        defaultParams[key] = value || '';
      }
      routeParamArrMap[route as keyof T] = Object.keys(params);
    }
  }
  const [initialRoute, initialRouteParams] = decomposeRoute(routes, window.location.href);
  const initialParams = ({...defaultParams, ...initialRouteParams});
  const [initialName, initialComponent] = selectComponent(routes, errorPages, initialRoute, initialParams, null);

  const initialContextState: RouterContextState<T> = {
    route: initialRoute,
    routeParams: initialParams,
    routeName: initialName,
    RouteComponent: initialComponent,
    user: null,
    updateRoute: (_route, _params) => void 0,
    updateRouteParams: (_params) => void 0,
    stringifyRoute: (_route, _params) => ''
  };

  function routerReducer(state: RouterContextState<any>, action: RouterReducerAction ): RouterContextState<any> {
    switch (action.type) {
      case 'on-popstate': {
        const [route, routeParams] = decomposeRoute(routes, window.location.href);
        const [routeName, RouteComponent] = selectComponent(routes, errorPages, route, routeParams, state.user);
        return {...state, route, routeParams, routeName, RouteComponent }
      }
      case 'update-route': {
        window.history.pushState({}, '', composeRoute(routes, action.payload.route, action.payload.params));
        const [routeName, RouteComponent] = selectComponent(routes, errorPages, action.payload.route, action.payload.params, state.user);
        return {...state, route: action.payload.route, routeParams: {...state.routeParams, ...action.payload.params}, routeName, RouteComponent }
      }
      case 'update-params': {
        window.history.pushState({}, '', composeRoute(routes, state.route as keyof T, action.payload.params));
        const [routeName, RouteComponent] = selectComponent(routes, errorPages, state.route as keyof T, action.payload.params, state.user);
        return {...state, routeName, RouteComponent, routeParams: {...state.routeParams, ...action.payload.params}}
      }
      case 'update-functions': {
        // @ts-ignore //TODO: fix typings; don't care about this at this point
        return {...state, ...action.payload};
      }
      case 'update-user': {
        const [routeName, RouteComponent] = selectComponent(routes, errorPages, state.route as string, state.routeParams, action.payload.user);
        return {...state, ...action.payload, routeName, RouteComponent };
      }
      default: {
        return state;
      }
    }
  }
  

  const RouterContext = createContext<RouterContextState<T>>(initialContextState);

  const RouterProvider: React.FC = function RouterProvider({children}) {
    const [state, dispatch] = useReducer(routerReducer, initialContextState);
    const userdata = useUserData();
    useEffect(() => {
      function updateRoute(route: string, params?: Record<string, string>) {
        dispatch({type: 'update-route', payload: {route, params}});
      }
      function updateRouteParams(params: Record<string, string>) {
        dispatch({type: 'update-params', payload: {params}})
      }
      function stringifyRoute(route: string, params?: Record<string, string>): string {
        return composeRoute<T, keyof T>(routes, route, params);
      }

      dispatch({type: 'update-functions', payload: {
        updateRoute,
        updateRouteParams,
        stringifyRoute
      }})
    }, []);
    useEffect(() => {
      if (homePath && state.route === '/') dispatch({type: 'update-route', payload: {route: homePath as string}})
    }, [state.route])
    window.addEventListener('popstate', () => {
      console.log('well this one fires');
      dispatch({type: 'on-popstate'});
    });
    useEffect(() => {
      dispatch({type: 'update-user', payload: {user: userdata.data || null}});
    }, [userdata.data]);
    return (
      <RouterContext.Provider value={state}>
        {children}
      </RouterContext.Provider>
    );
  }

  function useRouter() {
    const context = useContext(RouterContext);
    if (context === undefined) {
      throw new Error('useRouter must be used within a RouterProvider')
    }
    return context;
  }
  
  return { RouterProvider, useRouter };
}


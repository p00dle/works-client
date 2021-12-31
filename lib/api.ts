import type { Method, AxiosInstance } from 'axios';
import type { HttpApiParser } from '~/types/api';


interface ProgressEvent {
  loaded: number;
  total: number;
}

type AxiosInstanceLike = {
  request: (params: {method: Method, url: string, data?: any}) => any;
  defaults: {
    onDownloadProgress?: any,
    onUploadProgress?: any,
  },
  interceptors: {
    response: { use: (fn: (config: any) => any, fn2: (...args: any[]) => any) => any },
    request: { use: (fn: (config: any) => any, fn2: (...args: any[]) => any) => any }
  }

}
interface ApiFactoryParams {
  axiosInstance: AxiosInstanceLike;
  onRequest?: (requestCount: number) => any;
  onRequestError?: (err: unknown) => any;
  onUpdate?: (loaded: number, total: number) => any;
  onResponse?: (requestCount: number) => any;
  onResponseError?: (err: unknown) => any;
}

type Api<T extends HttpApiParser<any>> = {
  factory: <M extends keyof T, R extends keyof T[M]>(method: M, route: R, query?: T[M][R]['query'], payload?: T[M][R]['payload']) => () => Promise<T[M][R]['response']>;
  request: <M extends keyof T, R extends keyof T[M]>(method: M, route: R, query?: T[M][R]['query'], payload?: T[M][R]['payload']) => Promise<T[M][R]['response']>;
} 

function isMethodGet(method: any): boolean {
  if (typeof method !== 'string') throw new Error('Method is not a string');
  return method.toLowerCase() === 'get';
}

function getUrl(route: string, params: any, isGet: boolean): string {
  if (!params) return '/api' + route;
  const propsInBaseUrl = new Set<string>();
  let baseUrl = '/api' + route.replace(/\:[^\/]+/g, (str: string) => {
    const prop = str.substring(1);
    if ((params === undefined) || (params !== undefined && params[prop] === undefined)) {
      throw Error(`Route parameter missing: '${prop}'`);
    } else {
      propsInBaseUrl.add(prop);
      return params[prop];
    }
  });
  if (isGet) {
    const excessProps = Object.keys(params).filter(prop => !propsInBaseUrl.has(prop));
    if (excessProps.length > 0) {
      const strings: string[] = [];
      for (const prop of excessProps) {
        const val = params[prop];
        let str: string;
        if (typeof val === 'string') {
          if (val.length > 0) str = val;
          else continue;
        } else if (Array.isArray(val)) {
          if (val.length > 0) str = val.join(',');
          else str = 'null';
        } else {
          if (val !== undefined && val !== null) str = String(val);
          else continue;
        }
        strings.push(`${prop}=${encodeURIComponent(str)}`);
      }
      if (strings.length > 0) baseUrl += '?' + strings.join('&');
    }
  }
  return baseUrl;
  
}

const noOp = () => void 0;

export function apiFactory<T extends HttpApiParser<any>>({axiosInstance, onRequest = noOp, onRequestError = noOp, onUpdate = noOp, onResponse = noOp, onResponseError = noOp }: ApiFactoryParams ): Api<T> {
  let requestsCount = 0;

  axiosInstance.interceptors.request.use(config => {
    onRequest(++requestsCount);
    return config;
  }, onRequestError);
  
  const updateHandler = (progressEvent: ProgressEvent) => onUpdate(progressEvent.loaded, progressEvent.total);
  axiosInstance.defaults.onDownloadProgress = updateHandler;
  axiosInstance.defaults.onUploadProgress = updateHandler;

  axiosInstance.interceptors.response.use(config => {
    onResponse(--requestsCount);
    return config;
  }, onResponseError);
  const api: Api<T> = {
    factory: (method, route, query, payload) => {
      return () => {
        const methodStr = method as Method;
        const routeStr = route as string;
        const isGet = isMethodGet(methodStr);
        return isGet 
          ? axiosInstance.request({method: methodStr, url: getUrl(routeStr, query, true ) })
          : axiosInstance.request({method: methodStr, url: getUrl(routeStr, query, false ), data: payload });
      }
    },
    request: (method, route, query, payload) => {
      const methodStr = method as Method;
      const routeStr = route as string;
      const isGet = isMethodGet(methodStr);
      return isGet 
        ? axiosInstance.request({method: methodStr, url: getUrl(routeStr, query, true ) })
        : axiosInstance.request({method: methodStr, url: getUrl(routeStr, query, false ), data: payload });
    }
  }
  return api;
}

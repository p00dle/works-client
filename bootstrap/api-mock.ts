import { currentUserMock } from '~/data-mocks/current-user';
import { userMock } from '~/data-mocks/user';
import { randomArray } from '~/lib/mock-utils';

const mockData = {
  'GET': {
    '/users/userdata': currentUserMock,
    '/users': randomArray([50, 85], userMock)
  },
  'POST': {

  }
}

const SHOULD_SHOW_DEBUG = true;

export const mockAxiosInstance = {
  request: async ({method, url}: {method: string, url: string}) => {
    const route = typeof url === 'string' ? url.replace(/^\/api/, '') : url;
    if (SHOULD_SHOW_DEBUG) {
      console.debug(`API MOCK [${method}] [${route}]`);
    } 
    const methodData = mockData[method as keyof typeof mockData];
    if (!methodData) throw Error(`Method not defined: [${method}]`);
    const data = methodData[route as keyof typeof methodData];
    if (typeof data === undefined) throw Error(`Mock data not defined for [${method}] [${route}]`);
    return data;
  },
  defaults: {
    onDownloadProgress: null,
    onUploadProgress: null,
  },
  interceptors: {
    request: { use: () => void 0 },
    response: { use: () => void 0 },
  }
}

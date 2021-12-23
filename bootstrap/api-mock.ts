function randomNumber(from: number, to: number, integer = true): number {
  const delta = to - from;
  const rand = Math.random();
  const output = rand * delta + from;
  return integer ? Math.round(output) : output;
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.round(Math.random() * (arr.length - 1))];
}

const users = new Array(135).fill(0).map(() => ({
  username: randomFromArray(['johndoe', 'billybob', 'janedoe']),
  email: randomFromArray(['johndoe@acme.com', 'billybob@acme.com', 'janedoe@acme.com']),
  fullName: randomFromArray(['John Doe', 'Billy Bob', 'Jane Doe']),
  managerId: randomFromArray(['johndoe', 'billybob', 'janedoe']),
  role: randomFromArray(['admin', 'non-admin']),
  lastLogin: Date.now() - (randomNumber(0, 5) * 1000 * 60 * 60 * 24),
}));

const mockData = {
  'GET': {
    '/users/userdata': {username: 'username', fullName: 'User Von Name', role: 'admin'},
    '/users': users
  },
  'POST': {

  }
}


const SHOULD_SHOW_DEBUG = true;

function getMockData(method: string, route: string) {
  if (SHOULD_SHOW_DEBUG) {
    console.debug(`API MOCK [${method}] [${route}]`);
  } 
  const methodData = mockData[method as keyof typeof mockData];
  if (!methodData) throw Error(`Method not defined: [${method}]`);
  const data = methodData[route as keyof typeof methodData];
  if (typeof data === undefined) throw Error(`Mock data not defined for [${method}] [${route}]`);
  return data;
}

export const apiMock = {
  factory: (method: string, route: string) => {
    return async function () {
      return getMockData(method, route);
    }
  },
  request: async (method: string, route: string) => {
    return getMockData(method, route);
  }
}
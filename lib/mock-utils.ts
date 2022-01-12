function randomNumber(from: number, to: number): number {
  const delta = to - from;
  const rand = Math.random();
  const output = rand * delta + from;
  return Math.round(output);
}

export function randomArray<T = any>(array: number | [number, number], creatorFunction: () => T ): T[] {
  if (typeof array === 'number') {
    return new Array(array).fill(0).map(creatorFunction);
  } else if (Array.isArray(array) && array.length === 2 && typeof array[0] === 'number' && typeof array[1] === 'number') {
    return new Array(randomNumber(array[0], array[1])).fill(0).map(creatorFunction);
  } else {
    throw Error('Invalid array parameter: ' + array);
  }
}

export function randomFromArray<T>(arr: T[]): T {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}

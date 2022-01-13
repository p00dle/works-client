export const typeOf = <T>(val?: T) => val as T;


export function flatten<T>(arrOfArr: T[][]): T[] {
  const output = [];
  for (const arr of arrOfArr) {
    for (const cell of arr) {
      output.push(cell);
    }
  }
  return output;
}

export function removeFromArray<T>(value: T, array: T[], mutate = false): T[] {
  const index = array.findIndex(row => value === row);
  const found = index >= 0;
  if (mutate) {
    if (found) {
      array.splice(index, 1);
      return array;
    } else {
      return array;
    }
  } else {
    if (found) {
      return array.slice(0, index).concat(array.slice(index + 1));
    } else {
      return array.slice(0);
    }
  }
}

export function pushOnArray<T>(value: T, array: T[], mutate = false): T[] {
  if (mutate) {
    array.push(value);
    return array;
  } else {
    return array.slice().concat(value);
  }
}

export function replaceInArray<T>(value: T, newValue: T, array: T[], mutate = false): T[] {
  const index = array.findIndex(row => value === row);
  const found = index >= 0;
  if (mutate) {
    if (found) {
      array[index] = newValue;
    } 
    return array;
  } else {
    if (found) {
      return array.slice(0, index).concat([newValue, ...array.slice(index + 1)]);
    } else {
      return array.slice(0);
    }
  }
}

export function splitArray<T>(arr: T[], fn: (row: T) => boolean): [T[], T[]] {
  const arr1 = [];
  const arr2 = [];
  for (const row of arr) {
    if (fn(row)) arr1.push(row);
    else arr2.push(row);
  }

  return [arr1, arr2];
}

export function getUniqueValuesByProp<T, P extends keyof T>(prop: P, data: T[]): T[P][] {
  const propSet = new Set<T[P]>();
  for (const row of data) propSet.add(row[prop]);
  return Array.from(propSet.values());
}

export function areDictonariesEqual(dict1: Record<string, string>, dict2: Record<string, string>): boolean {
  if (typeof dict1 !== 'object' || dict1 === null || typeof dict2 !== 'object' || dict2 === null) return false;
  const keys1 = Object.keys(dict1);
  const keys2 = Object.keys(dict2);
  if (keys1.length === 0 && keys2.length === 0) return true;
  if (keys1.length !== keys2.length) return false;
  for (const prop of keys1) {
    if (dict1[prop] !== dict2[prop]) return false;
  }
  return true;
}
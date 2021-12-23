import { useState, useEffect } from 'react';

const dateStrRegex = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ/;
function parseJsonWithDates(obj: any): any {
  if (typeof obj === 'string' && dateStrRegex.test(obj)) return new Date(obj);
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, val] of Object.entries(obj)) {
      obj[key] = parseJsonWithDates(val);
    }
  } else if (Array.isArray(obj)) {
    return obj.map(parseJsonWithDates);
  }
  return obj;
}

function getLocalStorage<T = unknown>(key: string | null): T | null {
  if (key === null) return null;
  const output = localStorage.getItem(key);
  console.log(parseJsonWithDates(JSON.parse(output || '')));
  return output === null ? output : parseJsonWithDates(JSON.parse(output));
}

function setLocalStorage<T = unknown>(key: string | null, value: T) {
  if (key === null) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStorageState<T>(identifier: string | null, initialState: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const localState = getLocalStorage<T>(identifier);
    return localState === null ? initialState : localState;
  });
  useEffect(() => {
    const localData = getLocalStorage<T>(identifier);
    if (localData !== null) setState(localData);
  }, []);
  return [
    state,
    function setLocalStorageState(value: T) {
      setLocalStorage<T>(identifier, value);
      setState(value);
    }
  ];
}
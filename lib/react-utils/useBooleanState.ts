import { useState } from 'react';

export function useBooleanState(initialState: boolean): [boolean, () => void, () => void] {
  const [state, setState] = useState(initialState);
  return [
    state,
    () => setState(true),
    () => setState(false)
  ];
}
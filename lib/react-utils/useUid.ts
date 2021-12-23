import { useMemo } from 'react';

const lastUidByPrefix: Record<string, number> = {};
export function generateUid(prefix: string): string {
  if (!lastUidByPrefix[prefix]) lastUidByPrefix[prefix] = 0;
  return `${prefix}-${++lastUidByPrefix[prefix]}-`;
}

export function useUid(prefix = 'x'): string {
  return useMemo(() => generateUid(prefix), []);
}
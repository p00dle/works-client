import { useRef } from 'react';
import { useBooleanState } from '~/lib/react-utils/useBooleanState';
import { useOnClickOutside } from '~/lib/react-utils/useOnClickOutside';


export function useHideOnClickOutside(showInitially = false) {
  const [shouldShow, show, hide] = useBooleanState(showInitially);
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref, hide);
  return {shouldShow, show, hide, ref};
}
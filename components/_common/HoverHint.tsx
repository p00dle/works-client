import * as React from 'react';
import { useState } from 'react';
import { Icon } from '~/components/_common/Icon';
import { useBooleanState } from '~/lib/react-utils';

interface HoverHintProps {
  containerClassName?: string;
  hoverClassName?: string;
  iconClassName?: string;
  text?: string;
}

export const HoverHint: React.FC<HoverHintProps> = function HoverHint({ containerClassName, hoverClassName, iconClassName, children, text}) {
  const [shouldShow, show, hide] = useBooleanState(false);
  return (
    <span className={containerClassName || "relative ml-2"} onMouseEnter={show} onMouseLeave={hide}>
      <Icon className={iconClassName} icon="question-circle" />
      <dialog className={(hoverClassName || "absolute secondary min-w-[20rem] z-[4] p-2 border-2 rounded-lg") + (shouldShow ? " block" : " hidden")}>{text || children}</dialog> 
    </span>
  );
};

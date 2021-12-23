import * as React from 'react';

import type { IconName } from '@fortawesome/fontawesome-common-types';

interface IconProps {
  icon: IconName;
  className?: string;
}

export type { IconName } from '@fortawesome/fontawesome-common-types';

export const Icon: React.FC<IconProps> = function Icon({icon, className}) {
  return (
    <i className={`fas fa-${icon} ${className || ''}`} />
  )
}
import * as React from 'react';
import { WithClassName } from '~/types/react';
import { Link } from '~/components/_common/Link';

export const Logo: React.FC<WithClassName> = function Logo({className = ''}) {
  return (
    <div className={"flex items-center justify-center " + className}>
      <Link route="/home" >
        <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(0.5 0 0 0.5 0 0)">
            <title>Layer 1</title>
            <ellipse strokeWidth="5" cx="52" cy="73" rx="29" ry="29"/>
            <ellipse cx="408" cy="102" rx="0.5"/>
            <ellipse ry="15" rx="15"  cy="26" cx="103" strokeWidth="5"/>
            <rect rx="1" height="9" width="21" y="36" x="42"/>
            <rect rx="1" height="6" width="12" y="41" x="97"/>
            <rect rx="1" height="6" width="12" y="5.22741" x="97"/>
            <rect transform="rotate(-60, 22.5, 56.5454)" rx="1" height="9.09085" width="21" y="52" x="12"/>
            <rect transform="rotate(-120, 22.5, 90.5454)" rx="1" height="9.09085" width="21" y="86" x="12"/>
            <rect transform="rotate(-180, 52.5, 107.545)" rx="1" height="9.09085" width="21" y="103" x="42"/>
            <rect transform="rotate(60, 82.5, 56.5454)" rx="1" height="9.09085" width="21" y="52" x="72"/>
            <rect transform="rotate(120, 82.5, 90.5454)" rx="1" height="9.09085" width="21" y="86" x="72"/>
            <rect transform="rotate(-60, 87, 17)" rx="1" height="6" width="12" y="14" x="81"/>
            <rect transform="rotate(-120, 87, 36.1818)" rx="1" height="6" width="12" y="33.18176" x="81"/>
            <rect transform="rotate(-60, 119, 36.318)" rx="1" height="6" width="12" y="33.31805" x="113"/>
            <rect transform="rotate(-120, 119, 17.091)" rx="1" height="6" width="12" y="14.09098" x="113"/>
          </g>
        </svg>
      </Link>
    </div>    
  )
}
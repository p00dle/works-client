import * as React from 'react';
import { WithClassName } from '~/types/react';
import { Link } from '~/components/_common/Link';
import { Icon } from '~/components/_common/Icon';

export const Logo: React.FC<WithClassName> = function Logo({className = ''}) {
  return (
    <div className={"flex items-center justify-center " + className}>
      <Link route="/home" >
        <Icon className="text-[3rem]" icon="cogs" />
      </Link>
    </div>    
  )
}
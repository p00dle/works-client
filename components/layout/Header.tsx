import * as React from 'react';
import { useRouter } from '~/bootstrap/router';
import { UserMenu } from '~/components/layout/UserMenu';
import { WithClassName } from '~/types/react';

export const Header: React.FC<WithClassName> = function Header({className = ''}) {
  const { routeName } = useRouter();
  return (
    <header className={"flex items-center " + className}>
      <div className="text-2xl grow">
        {routeName}
      </div>
      <UserMenu />
    </header>
  )
}
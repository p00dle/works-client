import * as React from 'react';
import { useRouter } from '~/bootstrap/router';
import { DarkModeSwitcher } from '~/components/layout/DarkModeSwitcher';
import { UserMenu } from '~/components/layout/UserMenu';
import { WithClassName } from '~/types/react';

export const Header: React.FC<WithClassName> = function Header({className = ''}) {
  const { routeName } = useRouter();
  return (
    <header className={"flex items-center space-x-4" + className}>
      <div className="text-2xl grow">
        {routeName}
      </div>
      <UserMenu />
      <DarkModeSwitcher />
    </header>
  )
}
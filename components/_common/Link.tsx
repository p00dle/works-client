import type { AllRoutes } from '~/bootstrap/router';
import * as React from 'react';
import { useRouter } from '~/bootstrap/router';

type LinkParams<R extends keyof AllRoutes> = {
  route: R;
  params?: AllRoutes[R]['params'];
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Link = function Home<R extends keyof AllRoutes>({route, params, children, className = '', onClick}: LinkParams<R>) {
  const { updateRoute, stringifyRoute } = useRouter();
  const onLinkClick = (event: React.MouseEvent) => {
    updateRoute(route, params as any);
    event.preventDefault();
    if (onClick) onClick();
  }
  const href = stringifyRoute(route, params);
  return (
    <a className={`${className} cursor-pointer`} href={href} onClick={onLinkClick}>{children}</a>
  );
}
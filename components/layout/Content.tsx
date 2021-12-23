import * as React from 'react';
import { useRouter } from '~/bootstrap/router';
import { WithClassName } from '~/types/react';

export const Content: React.FC<WithClassName> = function Content({className = ''}) {
  const { RouteComponent, routeParams } = useRouter();
  // @ts-ignore
  return <div className={"" + " " + className}><RouteComponent {...routeParams} /></div>
  
      
}
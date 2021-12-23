import * as React from 'react';
import { ErrorPage } from './ErrorPage';

export const InvalidPath: React.FC = function InvalidPath(){
  return <ErrorPage text="Invalid Path" />;
};

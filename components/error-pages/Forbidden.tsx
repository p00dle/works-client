import * as React from 'react';
import { ErrorPage } from './ErrorPage';

export const Forbidden: React.FC = function Forbidden() {
  return <ErrorPage text="Forbidden" />;
};

import * as React from 'react';

export const ErrorPage: React.FC<{text: string}> = ({text}) => {
  return (
    <div>
      {text}
    </div>
  );
};

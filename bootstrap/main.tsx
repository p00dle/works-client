import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Layout } from '~/components/layout/Layout';
import { RouterProvider } from '~/bootstrap/router';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ModalProvider } from '~/components/layout/Modal';
import { telemetry } from '~/bootstrap/telemetry';
import { Telemetry } from '~/components/_common/Telemetry';

const queryClient = new QueryClient()

ReactDOM.render((
  <React.StrictMode>

    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <ModalProvider>
          <Layout />
        </ModalProvider>
        <Telemetry telemetry={telemetry} />
      </RouterProvider>
      { process.env.NODE_ENV === 'development' ? <ReactQueryDevtools /> : null }
    </QueryClientProvider> 
  </React.StrictMode>
), document.getElementById('root'));

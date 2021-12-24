import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Layout } from '~/components/layout/Layout';
import { RouterProvider } from '~/bootstrap/router';

import { ReactQueryDevtools } from 'react-query/devtools';

import { ModalProvider } from '~/components/layout/Modal';

const queryClient = new QueryClient()

ReactDOM.render((
  <React.StrictMode>

    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <ModalProvider>
          <Layout />
        </ModalProvider>
      </RouterProvider>
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider> 
  </React.StrictMode>
), document.getElementById('root'));

import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './utils/authConfig';
import { routes } from './routes';
import '@chatui/core/dist/index.css';
import './styles/chatui-theme.css';
import './index.css';

const router = createBrowserRouter(routes);

const App: React.FC = () => {

  useEffect(() => {
  }, []); // Removed appendMsg from dependencies

  return (
    <div>
      <MsalProvider instance={msalInstance}>
        <RouterProvider router={router} />
      </MsalProvider>
    </div>
  );
};

export default App;

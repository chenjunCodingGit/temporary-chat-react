import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
      <RouterProvider router={router} />
    </div>
  );
};

export default App;

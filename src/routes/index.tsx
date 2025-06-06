// src/routes/index.tsx
import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import CodeModePage from '../pages/CodeModePage';
import ErrorPage from '../pages/ErrorPage';
import Layout from '../layouts/Layout';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'codemode', element: <CodeModePage /> },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
];
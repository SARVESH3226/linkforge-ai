import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Analytics } from '../pages/Analytics';
import { Categories } from '../pages/Categories';
import { Settings } from '../pages/Settings';
import { PublicStats } from '../pages/PublicStats';

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: '/',
    element: <Landing />,
  },
  
  // Public Stats view (bonus feature)
  {
    path: '/stats/:code',
    element: <PublicStats />,
  },

  // Auth Group
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },

  // Authenticated Dashboard Group
  {
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/categories', element: <Categories /> },
      { path: '/settings', element: <Settings /> },
    ],
  },

  // Catch-all Redirect to Landing
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

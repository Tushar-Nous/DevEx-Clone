import React from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import LandingPage from './LandingPage';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, loading = false }) => {
  const isAuthenticated = useIsAuthenticated();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Define the breadcrumb mapping
  const breadcrumbMap = {
    '/': { label: 'Dashboard', icon: Home },
    '/user-stories': { label: 'User Stories', parent: 'Dashboard' },
    '/guidelines-generator': { label: 'Frontend', parent: 'Prompt Generation' },
    '/backend-prompt-generator': { label: 'Backend', parent: 'Prompt Generation' },
    '/generation-history': { label: 'Generation History', parent: 'Dashboard' },
    '/devops-integration': { label: 'DevOps Integration', parent: 'Dashboard' },
    '/integrations': { label: 'Integrations', parent: 'Dashboard' },
    '/golden-repo': { label: 'Golden Repository', parent: 'Dashboard' },
    '/knowledge-base': { label: 'Knowledge Base', parent: 'Dashboard' },
    '/persona-manager': { label: 'Persona Manager', parent: 'Dashboard' },
    '/prompt-library': { label: 'Prompt Library', parent: 'Dashboard' }
  };

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];
    
    // Always start with Dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/',
      icon: Home,
      isActive: path === '/'
    });

    // Add current page breadcrumb
    const currentPage = breadcrumbMap[path];
    if (currentPage) {
      // Add parent if exists and it's not Dashboard (to avoid duplication)
      if (currentPage.parent && currentPage.parent !== 'Dashboard') {
        breadcrumbs.push({
          label: currentPage.parent,
          path: null, // No link for parent categories
          isActive: false
        });
      }
      
      // Add current page
      breadcrumbs.push({
        label: currentPage.label,
        path: path,
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb on dashboard
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 lg:ml-72 ml-0">
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            
            {breadcrumb.path ? (
              <Link
                to={breadcrumb.path}
                className={`flex items-center space-x-1 transition-colors ${
                  breadcrumb.isActive
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {breadcrumb.icon && <breadcrumb.icon className="w-4 h-4" />}
                <span>{breadcrumb.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center space-x-1 ${
                breadcrumb.isActive
                  ? 'text-indigo-600 font-medium'
                  : 'text-gray-500'
              }`}>
                <span>{breadcrumb.label}</span>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
      <Link to="/workspace/admin/command-centre" className="breadcrumb-link home-crumb" title="Command Centre">
        <Home size={14} />
        <span>NSFC Ops</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight size={13} className="breadcrumb-separator" />
            {item.path && !isLast ? (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className={`breadcrumb-current ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

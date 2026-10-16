import React from 'react';

export type OperationalStatus = 
  | 'DRAFT'
  | 'INCOMPLETE'
  | 'SCHEDULED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'FIRST_HALF'
  | 'HALF_TIME'
  | 'SECOND_HALF'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'FULL_TIME_PENDING_REVIEW'
  | 'VERIFIED'
  | 'VERIFIED_PUBLISHED'
  | 'PUBLISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'ABANDONED'
  | 'ACTIVE'
  | 'UPCOMING'
  | 'CONCLUDED'
  | 'ARCHIVED'
  | 'PLANNING'
  | 'REGISTRATION_OPEN'
  | 'ELIGIBLE'
  | 'PENDING_REGISTRATION'
  | 'PENDING_DOCUMENTATION'
  | 'SUSPENDED'
  | 'INELIGIBLE'
  | 'AVAILABLE'
  | 'ASSIGNED';

interface AdminStatusBadgeProps {
  status: OperationalStatus | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  pulse = false 
}) => {
  const norm = (status || '').toUpperCase().replace(/\s+/g, '_');

  let variantClass = 'status-default';
  let label = status;

  switch (norm) {
    // Verified & Active States (Emerald)
    case 'VERIFIED':
    case 'VERIFIED_PUBLISHED':
      variantClass = 'status-verified';
      label = norm === 'VERIFIED_PUBLISHED' ? 'Verified & Published' : 'Verified';
      break;
    case 'PUBLISHED':
      variantClass = 'status-verified';
      label = 'Published';
      break;
    case 'ACTIVE':
      variantClass = 'status-verified';
      label = 'Active';
      break;
    case 'ELIGIBLE':
      variantClass = 'status-verified';
      label = 'Eligible';
      break;
    case 'READY':
      variantClass = 'status-ready';
      label = 'Ready';
      break;
    case 'AVAILABLE':
      variantClass = 'status-verified';
      label = 'Available';
      break;

    // In Progress / Live States (Orange Accent)
    case 'IN_PROGRESS':
    case 'FIRST_HALF':
    case 'HALF_TIME':
    case 'SECOND_HALF':
      variantClass = 'status-live';
      label = norm === 'FIRST_HALF' ? '1st Half' : norm === 'HALF_TIME' ? 'Half Time' : norm === 'SECOND_HALF' ? '2nd Half' : 'In Progress';
      break;

    // Review & Pending States (Amber)
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'FULL_TIME_PENDING_REVIEW':
      variantClass = 'status-review';
      label = norm === 'FULL_TIME_PENDING_REVIEW' ? 'FT Pending Review' : 'Under Review';
      break;
    case 'PENDING_REGISTRATION':
    case 'PENDING_DOCUMENTATION':
      variantClass = 'status-review';
      label = 'Pending Docs';
      break;
    case 'REGISTRATION_OPEN':
      variantClass = 'status-review';
      label = 'Registration Open';
      break;
    case 'ASSIGNED':
      variantClass = 'status-assigned';
      label = 'Assigned';
      break;

    // Draft & Planning States (Steel Grey)
    case 'DRAFT':
    case 'INCOMPLETE':
    case 'PLANNING':
      variantClass = 'status-draft';
      label = norm === 'INCOMPLETE' ? 'Incomplete' : norm === 'PLANNING' ? 'Planning' : 'Draft';
      break;
    case 'SCHEDULED':
    case 'UPCOMING':
      variantClass = 'status-scheduled';
      label = norm === 'SCHEDULED' ? 'Scheduled' : 'Upcoming';
      break;

    // Critical & Negative States (Rose / Red)
    case 'SUSPENDED':
      variantClass = 'status-urgent';
      label = 'Suspended';
      break;
    case 'INELIGIBLE':
      variantClass = 'status-urgent';
      label = 'Ineligible';
      break;
    case 'POSTPONED':
      variantClass = 'status-urgent';
      label = 'Postponed';
      break;
    case 'CANCELLED':
    case 'ABANDONED':
      variantClass = 'status-urgent';
      label = norm === 'ABANDONED' ? 'Abandoned' : 'Cancelled';
      break;
    case 'CONCLUDED':
    case 'ARCHIVED':
      variantClass = 'status-concluded';
      label = norm === 'ARCHIVED' ? 'Archived' : 'Concluded';
      break;
    default:
      variantClass = 'status-default';
      label = status.replace(/_/g, ' ');
  }

  const isLivePulse = pulse || ['IN_PROGRESS', 'FIRST_HALF', 'SECOND_HALF', 'FULL_TIME_PENDING_REVIEW'].includes(norm);

  return (
    <span className={`admin-status-badge ${variantClass} size-${size}`}>
      {isLivePulse && <span className="status-pulse-dot" />}
      <span className="status-label">{label}</span>
    </span>
  );
};

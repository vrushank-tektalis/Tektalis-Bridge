import React from 'react';
import Badge from './Badge';

const colorMap = {
  // Project Statuses
  DRAFT: 'gray',
  ACTIVE: 'blue',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
  ARCHIVED: 'gray',

  // Project Stages
  REQUIREMENT_ANALYSIS: 'indigo',
  PLANNING: 'blue',
  DEVELOPMENT: 'indigo',
  CODE_REVIEW: 'warning',
  TESTING: 'warning',
  BUG_FIXING: 'error',
  UAT: 'info',
  DEPLOYMENT: 'info',
  PRODUCTION: 'success',
  MAINTENANCE: 'warning',

  // Tasks
  TODO: 'gray',
  IN_PROGRESS: 'blue',
  IN_REVIEW: 'warning',
  DONE: 'success',

  // Bugs
  OPEN: 'error',
  ASSIGNED: 'warning',
  FIXED: 'blue',
  CLOSED: 'success',
  REOPENED: 'error',

  // Priorities
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'warning',
  CRITICAL: 'error',

  // Availabilities
  AVAILABLE: 'success',
  BUSY: 'warning',
  UNAVAILABLE: 'error',

  // Requests
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const StatusBadge = ({ status, className = '' }) => {
  const normalizedStatus = status?.toUpperCase() || 'UNKNOWN';
  const color = colorMap[normalizedStatus] || 'gray';
  const label = status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <Badge variant={color} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  const variants = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
    neutral: 'badge-neutral',
  };

  return (
    <span className={cn('badge', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

// Status-specific badges
interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusLower = status.toLowerCase();
  
  let variant: BadgeProps['variant'] = 'neutral';
  
  if (['running', 'active', 'success', 'filled', 'open', 'online'].includes(statusLower)) {
    variant = 'success';
  } else if (['stopped', 'closed', 'cancelled', 'canceled', 'offline'].includes(statusLower)) {
    variant = 'neutral';
  } else if (['error', 'failed', 'rejected'].includes(statusLower)) {
    variant = 'danger';
  } else if (['pending', 'starting', 'stopping', 'partial', 'warning'].includes(statusLower)) {
    variant = 'warning';
  }

  return (
    <Badge variant={variant} className={className} {...props}>
      {status}
    </Badge>
  );
}



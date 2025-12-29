import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

// Preset skeleton components
export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton width="40%" className="mb-3" />
      <Skeleton width="60%" height={32} className="mb-4" />
      <div className="flex gap-4">
        <Skeleton width="30%" />
        <Skeleton width="30%" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-container">
      <div className="bg-dark-800/50 px-4 py-3 border-b border-dark-700">
        <div className="flex gap-4">
          <Skeleton width="15%" />
          <Skeleton width="20%" />
          <Skeleton width="15%" />
          <Skeleton width="20%" />
          <Skeleton width="15%" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-dark-700/50">
          <div className="flex gap-4">
            <Skeleton width="15%" />
            <Skeleton width="20%" />
            <Skeleton width="15%" />
            <Skeleton width="20%" />
            <Skeleton width="15%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <Skeleton variant="rectangular" width="100%" height={height} />
  );
}



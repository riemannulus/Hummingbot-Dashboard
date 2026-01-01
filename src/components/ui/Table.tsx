import React from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Hide this column on mobile (below md breakpoint) */
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
}: TableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('table-container overflow-x-auto -mx-px', className)}>
      <table className="table min-w-[600px] md:min-w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  alignClasses[column.align || 'left'],
                  column.hideOnMobile && 'hidden md:table-cell'
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(column.hideOnMobile && 'hidden md:table-cell')}
                  >
                    <div className="skeleton h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-dark-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((column) => {
                  const value = (row as Record<string, unknown>)[column.key];
                  return (
                    <td
                      key={column.key}
                      className={cn(
                        alignClasses[column.align || 'left'],
                        column.hideOnMobile && 'hidden md:table-cell'
                      )}
                    >
                      {column.render
                        ? column.render(value, row, index)
                        : String(value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Simple data row component
interface DataRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DataRow({ label, value, className }: DataRowProps) {
  return (
    <div className={cn('flex justify-between items-center py-2', className)}>
      <span className="text-dark-400 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

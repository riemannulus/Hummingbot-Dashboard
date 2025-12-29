import { type ClassValue, clsx } from './clsx';

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format number with commas and decimals
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  } = {}
): string {
  const { decimals = 2, prefix = '', suffix = '', compact = false } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  
  if (compact && Math.abs(value) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    let unitIndex = 0;
    let compactValue = value;
    
    while (Math.abs(compactValue) >= 1000 && unitIndex < units.length - 1) {
      compactValue /= 1000;
      unitIndex++;
    }
    
    return `${prefix}${compactValue.toFixed(decimals)}${units[unitIndex]}${suffix}`;
  }
  
  return `${prefix}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

// Format currency
export function formatCurrency(value: number, compact = false): string {
  return formatNumber(value, { prefix: '$', decimals: 2, compact });
}

// Format percentage
export function formatPercentage(value: number, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

// Format crypto amount
export function formatCrypto(value: number, symbol?: string): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  
  const decimals = value < 0.001 ? 8 : value < 1 ? 6 : value < 1000 ? 4 : 2;
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  
  return symbol ? `${formatted} ${symbol}` : formatted;
}

// Format timestamp
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// Format date
export function formatDate(timestamp: number, includeTime = false): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }
  
  return date.toLocaleDateString('en-US', options);
}

// Format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Format duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

// Truncate address
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Get profit/loss color class
export function getPnlColorClass(value: number): string {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return 'text-dark-300';
}

// Get status color class
export function getStatusColorClass(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (['running', 'active', 'success', 'filled', 'open'].includes(statusLower)) {
    return 'badge-success';
  }
  if (['stopped', 'closed', 'cancelled', 'canceled'].includes(statusLower)) {
    return 'badge-neutral';
  }
  if (['error', 'failed', 'rejected'].includes(statusLower)) {
    return 'badge-danger';
  }
  if (['pending', 'starting', 'stopping', 'partial'].includes(statusLower)) {
    return 'badge-warning';
  }
  
  return 'badge-neutral';
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}



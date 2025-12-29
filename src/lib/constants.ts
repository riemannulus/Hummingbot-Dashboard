// API Configuration
export const API_BASE_URL = '/api';

// Polling Intervals (in milliseconds)
export const POLLING_INTERVALS = {
  PORTFOLIO: 5000,      // 5 seconds
  BOT_STATUS: 3000,     // 3 seconds
  ACTIVE_ORDERS: 2000,  // 2 seconds
  POSITIONS: 3000,      // 3 seconds
  MARKET_PRICES: 1000,  // 1 second
  TRADES: 5000,         // 5 seconds
  DEFAULT: 5000,        // 5 seconds
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_CREDENTIALS: 'hb_auth_credentials',
  THEME: 'hb_theme',
  SIDEBAR_COLLAPSED: 'hb_sidebar_collapsed',
  REFRESH_SETTINGS: 'hb_refresh_settings',
} as const;

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PORTFOLIO: '/portfolio',
  BOTS: '/bots',
  TRADING: '/trading',
  SETTINGS: '/settings',
} as const;

// Navigation Items
export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.PORTFOLIO, label: 'Portfolio', icon: 'Wallet' },
  { path: ROUTES.BOTS, label: 'Bots', icon: 'Bot' },
  { path: ROUTES.TRADING, label: 'Trading', icon: 'ArrowLeftRight' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
] as const;

// Chart Colors
export const CHART_COLORS = {
  primary: '#00d4aa',
  secondary: '#14b8a6',
  tertiary: '#10b981',
  profit: '#22c55e',
  loss: '#ef4444',
  warning: '#f59e0b',
  neutral: '#6b6b7a',
  // Multi-color palette for pie/donut charts
  palette: [
    '#00d4aa',
    '#14b8a6',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ],
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM d, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;



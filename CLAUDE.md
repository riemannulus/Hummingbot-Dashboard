# Hummingbot Dashboard

A React-based dashboard for monitoring and managing Hummingbot trading bots.

## Development

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

### Running the Dashboard

```sh
bun --hot ./index.ts
```

The dashboard runs on `http://localhost:3000`.

## Docker Deployment

### Build and Run Locally

```sh
# Build the image
docker build -t hummingbot-dashboard .

# Run the container
docker run -p 3000:3000 -e API_BASE=http://your-api-server:8000 hummingbot-dashboard
```

### Using Docker Compose

```sh
# Start the service
docker compose up -d

# With custom API server
API_BASE=http://your-api-server:8000 docker compose up -d

# View logs
docker compose logs -f

# Stop the service
docker compose down
```

### Pull from GitHub Container Registry

```sh
# Pull the latest image
docker pull ghcr.io/riemannulus/hummingbot-dashboard:latest

# Run with custom API server
docker run -p 3000:3000 \
  -e API_BASE=http://your-api-server:8000 \
  ghcr.io/riemannulus/hummingbot-dashboard:latest
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE` | `http://34.64.187.136:8000` | Backend API server URL |
| `NODE_ENV` | `production` | Node environment |

### GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) that:
- Builds Docker image on push to `main`/`master` branches
- Pushes to GitHub Container Registry (ghcr.io)
- Supports multi-architecture builds (amd64, arm64)
- Tags images with branch name, commit SHA, and semantic versions

## Backend API

### Server Configuration

- **API Server**: `http://34.64.187.136:8000`
- **Authentication**: HTTP Basic Auth (`admin` / `yjamtc167`)
- **API Documentation**: `http://34.64.187.136:8000/docs` (Swagger UI)

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `/bot-orchestration/status` | Get all bots status and performance |
| `/bot-orchestration/{bot_name}/status` | Get single bot status |
| `/bot-orchestration/{bot_name}/history?verbose=true` | Get trade history (use `verbose=true` for detailed trades) |
| `/bot-orchestration/{bot_name}/controller-configs` | Get bot's strategy configurations |
| `/bot-orchestration/run-history` | Get all bot run history |
| `/accounts` | List connected exchange accounts |
| `/controllers/configs` | List available controller configurations |
| `/portfolio/state` | Get current portfolio state with balances |
| `/portfolio/distribution` | Get asset distribution |
| `/portfolio/history` | Get portfolio value history |

### API Response Structure

Most API responses are wrapped in a standard format:

```json
{
  "status": "success",
  "data": { ... actual data ... }
}
```

**Important**: Always unwrap the `data` field when processing API responses.

### Bot Performance Data Structure

Bot status returns nested performance data:

```json
{
  "bot_name": {
    "status": "running",
    "performance": {
      "controller_id": {
        "status": "running",
        "performance": {
          "realized_pnl_quote": 0.0,
          "unrealized_pnl_quote": -0.85,
          "global_pnl_quote": -0.85,
          "global_pnl_pct": -0.08,
          "volume_traded": 1010.27
        }
      }
    }
  }
}
```

To aggregate total performance across all controllers in a bot, iterate through `performance` object entries.

## Project Structure

```
src/
├── api/
│   ├── client.ts           # ApiClient class with HTTP Basic Auth
│   └── services/
│       ├── bots.ts         # Bot management API calls
│       ├── portfolio.ts    # Portfolio API calls
│       ├── accounts.ts     # Exchange accounts API
│       └── controllers.ts  # Controller configs API
├── features/
│   ├── dashboard/
│   │   ├── DashboardPage.tsx       # Main dashboard
│   │   ├── TotalBalanceCard.tsx    # Portfolio balance display
│   │   ├── AssetDistribution.tsx   # Donut chart for assets
│   │   ├── PortfolioChart.tsx      # Historical portfolio graph
│   │   └── ActiveBotsWidget.tsx    # Active bots summary
│   ├── bots/
│   │   ├── BotsPage.tsx           # Bots list & management
│   │   ├── BotDetailPage.tsx      # Individual bot details
│   │   └── DeployBotModal.tsx     # Bot deployment modal
│   └── portfolio/
│       └── PortfolioPage.tsx      # Detailed portfolio view
├── types/
│   └── api.ts              # TypeScript interfaces for API data
├── hooks/
│   ├── useApi.ts           # API call hook
│   ├── usePolling.ts       # Polling hook for real-time data
│   └── useLazyApi.ts       # Lazy API call hook
└── App.tsx                 # Main router
```

## Key Types

### BotStatus

```typescript
interface BotStatus {
  status: 'running' | 'stopped' | 'error';
  performance: {
    [controllerId: string]: {
      status: string;
      performance: {
        realized_pnl_quote: number;
        unrealized_pnl_quote: number;
        global_pnl_quote: number;
        global_pnl_pct: number;
        volume_traded: number;
      };
    };
  };
}
```

### PortfolioDistribution

```typescript
interface PortfolioDistribution {
  total_portfolio_value: number;  // NOT total_value_usd
  distribution: TokenBalance[];   // NOT tokens
}
```

### PortfolioHistoryItem

```typescript
interface PortfolioHistoryItem {
  timestamp: string;  // ISO format, needs conversion: new Date(timestamp).getTime()
  state: {
    [token: string]: {
      value: number;
      // ... other fields
    };
  };
}
```

## Common Issues & Solutions

### 1. 401 Unauthorized Errors

**Problem**: API calls failing with 401.

**Solution**: Ensure `ApiClient` sends correct Authorization header:
```typescript
headers: {
  'Authorization': `Basic ${btoa(`${username}:${password}`)}`
}
```

### 2. Bot PnL Showing $0.00

**Problem**: Performance data not displaying.

**Cause**: API returns nested `performance` object structure.

**Solution**: Iterate through performance entries to aggregate values:
```typescript
Object.entries(botStatus.performance).forEach(([id, controller]) => {
  totalPnl += controller.performance.global_pnl_quote;
  totalVolume += controller.performance.volume_traded;
});
```

### 3. Portfolio History Graph Not Rendering

**Problem**: Chart shows no data.

**Cause**: 
- `timestamp` is ISO string (needs conversion to number)
- `total_value_usd` doesn't exist (must be calculated from `state`)

**Solution**:
```typescript
const chartData = history.data.map(item => ({
  timestamp: new Date(item.timestamp).getTime(),
  total_value_usd: Object.values(item.state).reduce((sum, t) => sum + t.value, 0)
}));
```

### 4. Deploy Bot Modal Not Loading

**Problem**: Modal shows "No controller configs available".

**Cause**: `useApi` doesn't auto-fetch; needs explicit trigger.

**Solution**: Use `useEffect` to fetch when modal opens:
```typescript
useEffect(() => {
  if (isOpen) {
    fetchAccounts();
    fetchConfigs();
  }
}, [isOpen]);
```

### 5. API Response Wrapper

**Problem**: Data fields are undefined.

**Cause**: API wraps responses in `{ status, data }`.

**Solution**: Unwrap in service layer:
```typescript
async getBotStatus(name: string) {
  const response = await this.client.get(`/bot-orchestration/${name}/status`);
  return response.data;  // Unwrap here
}
```

## Bun APIs Reference

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

/**
 * Authentication Middleware
 * Validates requests using Basic Auth against the Hummingbot Backend API
 */

const API_BASE = process.env.API_BASE || "http://localhost:8000";

// Cache for validated credentials to reduce backend calls
const validatedCredentials = new Map<string, { validUntil: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Validates credentials against the Hummingbot Backend API
 */
async function validateWithBackend(authHeader: string): Promise<boolean> {
  // Check cache first
  const cached = validatedCredentials.get(authHeader);
  if (cached && cached.validUntil > Date.now()) {
    return true;
  }

  try {
    // Use the bot-orchestration/status endpoint to validate credentials
    const response = await fetch(`${API_BASE}/bot-orchestration/status`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    // 401 means invalid credentials
    if (response.status === 401) {
      validatedCredentials.delete(authHeader);
      return false;
    }

    // Any other response (200, 404, 500) means credentials are valid
    validatedCredentials.set(authHeader, {
      validUntil: Date.now() + CACHE_TTL,
    });
    return true;
  } catch (error) {
    console.error("Auth validation error:", error);
    // On network error, reject for security
    return false;
  }
}

/**
 * Extract username from Basic Auth header
 */
export function extractUsername(authHeader: string): string | null {
  if (!authHeader.startsWith("Basic ")) {
    return null;
  }

  try {
    const base64 = authHeader.slice(6);
    const decoded = atob(base64);
    const [username] = decoded.split(":");
    return username || null;
  } catch {
    return null;
  }
}

/**
 * Authentication middleware for protected routes
 * Returns null if authenticated, or an error Response if not
 */
export async function authMiddleware(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "No credentials provided" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!authHeader.startsWith("Basic ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Invalid authentication scheme" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const isValid = await validateWithBackend(authHeader);

  if (!isValid) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Invalid credentials" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Authentication successful
  return null;
}

/**
 * Helper to create an authenticated request handler
 */
export function withAuth(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const authError = await authMiddleware(req);
    if (authError) {
      return authError;
    }
    return handler(req);
  };
}

/**
 * Clear credentials cache (useful for testing or logout)
 */
export function clearCredentialsCache(): void {
  validatedCredentials.clear();
}


import index from "./index.html";

const API_BASE = process.env.API_BASE || "http://localhost:8000";

Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/login": index,
    "/dashboard": index,
    "/portfolio": index,
    "/bots": index,
    "/bots/*": index,
    "/trading": index,
    "/settings": index,
    "/settings/*": index,
    
    // API Proxy to bypass CORS
    "/api/*": async (req) => {
      const url = new URL(req.url);
      const apiPath = url.pathname.replace(/^\/api/, "");
      const targetUrl = `${API_BASE}${apiPath}${url.search}`;
      
      try {
        const headers = new Headers();
        
        // Forward Authorization header
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          headers.set("Authorization", authHeader);
        }
        
        // Forward Content-Type
        const contentType = req.headers.get("Content-Type");
        if (contentType) {
          headers.set("Content-Type", contentType);
        }
        
        const response = await fetch(targetUrl, {
          method: req.method,
          headers,
          body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
        });
        
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        
        // Remove WWW-Authenticate header to prevent browser's native auth dialog
        responseHeaders.delete("WWW-Authenticate");
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } catch (error) {
        console.error("API Proxy Error:", error);
        return new Response(JSON.stringify({ error: "API request failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
  },
  
  // Handle CORS preflight
  fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
  
  // Only enable development features in non-production
  ...(process.env.NODE_ENV !== "production" && {
    development: {
      hmr: true,
      console: true,
    },
  }),
});

console.log("🚀 Hummingbot Dashboard running at http://localhost:3000");

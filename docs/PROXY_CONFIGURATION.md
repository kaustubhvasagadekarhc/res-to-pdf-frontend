# Proxy Configuration & CORS Handling

To avoid CORS (Cross-Origin Resource Sharing) issues during development and production, this project uses a Next.js Rewrite Proxy.

## How it Works

Instead of the frontend (browser) making requests directly to the backend API (which might be on a different port or domain), requests are sent to the Next.js server itself at `/api/proxy`. The Next.js server then forwards these requests to the actual backend.

**Flow:**
`Browser` -> `Next.js Server (/api/proxy/...)` -> `Backend Server (http://localhost:5000/...)`

Since the request is made from `Browser` to `Next.js Server` (same origin), the browser does not enforce CORS. The `Next.js Server` then talks to the `Backend Server` (server-to-server), where CORS is not relevant.

## Configuration

### `next.config.ts`

We define a rewrite rule:

```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/:path*`,
      },
    ];
  },
};
```

### `app/api/client.ts`

The API client is configured to base all requests on `/api/proxy` instead of the direct backend URL:

```typescript
this.baseURL = baseURL || "/api/proxy";
```

## Troubleshooting

-   **404 on API calls**: Ensure the backend is running and `NEXT_PUBLIC_API_URL` is set correctly.
-   **Proxy not working**: Restart the `npm run dev` server after changing `next.config.ts`.

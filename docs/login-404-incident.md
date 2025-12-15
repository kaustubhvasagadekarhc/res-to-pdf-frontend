# /login 404 Incident Report

**Issue Summary**

A frontend XHR request to the login endpoint returned HTTP 404 (Not Found) when attempting to sign in.

**Symptoms**

- Browser DevTools showed a 404 for the login XHR initiated from `request.ts` (generated client) at the app runtime.
- The request was triggered by the frontend call `authService.postAuthLogin(...)` from `components/auth/login-form.tsx`.
- The network request resolved to an incorrect backend path, producing 404.

# /login 404 Incident Report

## Issue Summary

A frontend XHR request to the login endpoint returned HTTP 404 (Not Found) when attempting to sign in from the running app.

## Symptoms

- DevTools showed a 404 for the login XHR initiated from the generated client (`request.ts`).
- The request was triggered by `authService.postAuthLogin(...)` in `components/auth/login-form.tsx`.
- Postman (manual check) shows the backend accepts login at `http://localhost:5000/auth/login` (host root + `/auth/login`) and returns 200 for valid credentials.

## Root Cause Analysis

- The generated OpenAPI client builds request URLs by concatenating `OpenAPI.BASE` and the service path (for example `OpenAPI.BASE + '/auth/login'`).
- `OpenAPI.BASE` is set at runtime from the custom `ApiClientWithServices` constructor in `app/api/client.ts`.
- In the running frontend, `OpenAPI.BASE` was configured with a value that included an extra path segment (for example `http://localhost:5000/api` or `http://localhost:5000/api/v1`). That produced requests like `http://localhost:5000/api/auth/login` or `http://localhost:5000/api/v1/auth/login` which did not match the backend route hosted at `http://localhost:5000/auth/login`, causing a 404.

## Why This Happened (Technical)

- Multiple configuration defaults existed across the repo (`lib/axiosInstance.ts`, `app/api/configuration.ts`, and `app/api/client.ts`) and were not guaranteed to match the backend's base path.
- The generated client does not normalize or validate the final URL; it trusts `OpenAPI.BASE` to be the correct host+prefix. A mismatched `OpenAPI.BASE` therefore produced a wrong, non-existent endpoint.

## Fix Implemented

- Applied a minimal, targeted change: set the default `ApiClient` base to the host root `http://localhost:5000` so that `OpenAPI.BASE + '/auth/login'` becomes `http://localhost:5000/auth/login`, matching the backend observed in Postman.

Code change (exact)

- File: [app/api/client.ts](app/api/client.ts#L1)
- Change (constructor default):

Before:

```ts
this.baseURL =
  baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
```

After:

```ts
this.baseURL =
  baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
```

## Why the Fix Works

- The generated client's `getUrl()` concatenates `OpenAPI.BASE` with the endpoint path. Setting `OpenAPI.BASE` to the host root produces `http://localhost:5000/auth/login`, which matches the backend route that returns 200 in Postman.

## Preventive Suggestions

- Consolidate a single source of truth for the API base URL by using `NEXT_PUBLIC_API_URL` in your environment and referencing it everywhere.
- Optionally derive the API client base from `axiosInstance.defaults.baseURL` or `app/api/configuration.ts` so there is only one canonical value.
- Add a small runtime assertion at startup that compares `OpenAPI.BASE` and `axiosInstance.defaults.baseURL` and logs a warning if they differ.

## Verification Steps

1. Ensure backend is running and exposes login at `http://localhost:5000/auth/login`.
2. Start the Next.js frontend.
3. Open DevTools → Network and submit the login form.
4. Confirm the POST goes to `http://localhost:5000/auth/login` and returns 200/401 (not 404).

## Files to inspect

- [app/api/client.ts](app/api/client.ts#L1)
- [app/api/generated/core/OpenAPI.ts](app/api/generated/core/OpenAPI.ts#L1)
- [app/api/generated/core/request.ts](app/api/generated/core/request.ts#L1)
- [lib/axiosInstance.ts](lib/axiosInstance.ts#L1)
- [components/auth/login-form.tsx](components/auth/login-form.tsx#L1)

---

If you want, I can also:

- Add a startup assertion comparing `OpenAPI.BASE` and `axiosInstance.defaults.baseURL` and log a clear error/warning, or
- Make `ApiClient` derive its default base from `axiosInstance.defaults.baseURL` so there is a single source of truth.

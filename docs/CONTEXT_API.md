# Context API System

This project uses React Context API to manage global state, specifically user authentication and profile data. The primary context is `UserContext`.

## Overview

The `UserContext` provides:
- Current authenticated `user` object.
- `loading` state during initial fetch.
- `refreshUser()` method to reload user data from the API.

## Setup

The application is wrapped in `Providers` component in `app/layout.tsx`. This ensures all client-side contexts are available throughout the component tree.

```tsx
// app/layout.tsx
import { Providers } from "@/components/providers";

export default function RootLayout({ children }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
```

## How to Use

### 1. Consuming User Data

Use the `useUser` custom hook in any client component.

```tsx
"use client";

import { useUser } from "@/contexts/UserContext";

export function UserProfile() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### 2. Protecting Routes

You can use the user state to redirect unauthorized users.

```tsx
"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedComponent() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return <div>Secure Content</div>;
}
```

### 3. Refreshing Data

If you update the user's profile or change roles, call `refreshUser()` to sync the state.

```tsx
const { refreshUser } = useUser();

const handleUpdate = async () => {
    await updateProfile(data);
    await refreshUser(); // Refetch latest user data
};
```

## State Definition

The `User` object follows this interface:

```typescript
interface User {
  id: string;
  name?: string;
  email?: string;
  userType?: "USER" | "ADMIN";
}
```

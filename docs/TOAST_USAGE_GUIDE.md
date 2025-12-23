# Toast Notification Usage Guide

This project uses `sonner` for toast notifications, providing a better user experience than browser alerts.

## Setup

The toast system is pre-configured with the `Toaster` component in `app/layout.tsx`. No additional setup is needed to use it in your components.

## Basic Usage

1. **Import `toast`**:
   ```typescript
   import { toast } from "sonner";
   ```

2. **Trigger a Toast**:
   ```typescript
   // Success message
   toast.success("Operation successful");

   // Error message
   toast.error("Something went wrong");

   // Info/Default message
   toast("Event has been created");
   ```

## Customization

You can customize the duration and description:

```typescript
toast.success("File uploaded", {
  description: "The file 'resume.pdf' has been processed.",
  duration: 2000, // 2 seconds (default configured)
});
```

## Best Practices

- **Success**: Use for confirmations (saved, updated, deleted).
- **Error**: Use for API failures or validation errors.
- **Duration**: Keep it short (2-3 seconds) for transient messages.
- **Placement**: Automatically handled (bottom-right by default).

## Example Component

```tsx
"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MyComponent() {
  const handleClick = () => {
    try {
      // Do something
      toast.success("Action completed!");
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  return <Button onClick={handleClick}>Click Me</Button>;
}
```

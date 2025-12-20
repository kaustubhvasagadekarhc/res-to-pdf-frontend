# Frontend Architecture Documentation

## 1. Overview
The **Resume to PDF Converter** frontend is built using **Next.js 14+ (App Router)**. It leverages **TypeScript** for type safety, **Tailwind CSS** for styling, and **Shadcn/UI** for its component library.

## 2. Directory Structure
```
/app
  ├── (auth)/             # Public authentication routes
  ├── (dashboard)/        # Protected application routes (User & Admin)
  ├── api/                # Backend API proxy & Client generation
  ├── globals.css         # Global styles & Theme variables
  └── layout.tsx          # Root layout with Providers
/components
  ├── auth/               # Authentication forms
  ├── layout/             # Header, Sidebar
  ├── ui/                 # Reusable UI primitives (Shadcn)
  └── providers.tsx       # Global Context Providers
/contexts                 # React Context definitions (UserContext)
/services                 # API Service integration
```

## 3. Routing System

### Auth Routes (Public)
Grouped under `(auth)` layout:
- `/login`: User login page.
- `/register`: New account creation.
- `/forgot-password`: Password recovery.
- `/otp-verification`: Email verification step.

### User Dashboard (Protected)
Base path `/user`:
- `/user`: Dashboard home (My Resume).
- `/user/resumes`: List of saved resumes.
- `/user/upload`: Upload resume for parsing.
- `/user/edit`: Interactive resume editor.
- `/user/result`: Final PDF preview and download.

### Admin Dashboard (Protected)
Base path `/admin`:
- `/admin`: Dashboard overview.
- `/admin/users`: User management interface.
- `/admin/activities`: System activity logs.
- `/admin/settings`: System configuration.

## 4. State Management

### User Context
The application uses a `UserContext` to manage the authenticated session.
- **Provider**: `UserProvider` (wrapped in `components/providers.tsx` -> `app/layout.tsx`).
- **Hook**: `useUser()`
- **Data**: Provides `user` object, `loading` state, and `refreshUser()` function.
- **Behavior**: Automaticaly fetches user profile (`/me`) on mount.

### Authentication Service
Located in `services/auth.services.ts`.
- Manages `auth-token` in Cookies and LocalStorage.
- Provides `isAuthenticated()`, `getToken()`, `clearToken()`.

## 5. API Layer
The application uses a generated API client pattern.
- **Client**: `app/api/client.ts` exports a singleton `apiClient`.
- **Generation**: Uses OpenAPI generator to create typed services in `services/generated`.
- **Services**:
    - `authService`: Login, Register, Profile.
    - `pdfService`: PDF generation endpoints.
    - `resumeService`: CRUD operations for resumes.
    - `adminService`: Admin-specific operations.

## 6. Theming & Design System

### Technology
- **Tailwind CSS**: Utility-first styling.
- **CSS Variables**: Defined in `globals.css` for runtime dynamic theming.
- **Fonts**: `Geist` and `Geist_Mono` (Next.js fonts).

### Color Palette (Blue Theme)
- **Primary**: `#2b7dff` (Blue)
- **Background**: White (Light), Dark Blue/Black (Dark)
- **Sidebar**: Custom variables for sidebar specific styling.

### Key Globa Classes
- `.glass-effect`: Glassmorphism background for cards/headers.
- `.text-gradient`: Linear gradient text effect (Primary to Accent).

## 7. Key Components

### UI Primitives (`components/ui`)
Standard Shadcn components: `Button`, `Card`, `Dialog`, `Input`, `Select`, `Table`, etc.

### Layout Components
- `Header`: Sticky top bar with User profile and Logout.
- `Sidebar`: Navigation menu (Dynamic based on User/Admin role).

## 8. Development Notes
- **Middleware**: Middleware support is currently disabled/removed. Auth protection relies on client-side checks in Context/Components.
- **Icons**: API uses `lucide-react`.

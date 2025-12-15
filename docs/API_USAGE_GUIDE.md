# API Client Generation and Usage Guide

## Overview

The `scripts/generate-api.js` script is a Node.js utility that automatically generates a typed frontend client from a Swagger/OpenAPI specification. It uses the `openapi-typescript-codegen` tool to create API clients with TypeScript type definitions for improved developer experience and type safety.

## Generated API Structure

After successful execution, the script creates the following structure in `app/api/generated/`:

```
app/api/generated/
├── core/           # Core functionality (ApiError, request handling, etc.)
│   ├── ApiError.ts
│   ├── ApiRequestOptions.ts
│   ├── ApiResult.ts
│   ├── CancelablePromise.ts
│   ├── OpenAPI.ts
│   └── request.ts
├── services/       # API service classes based on OpenAPI paths
│   ├── AuthService.ts
│   ├── PdfService.ts
│   └── ResumeService.ts
├── index.ts        # Main exports for easy import
```

### Core Modules
- **ApiError.ts**: Custom error class for API errors with request/response details
- **CancelablePromise.ts**: Promise implementation with cancellation support
- **OpenAPI.ts**: Configuration object for API settings (base URL, credentials, etc.)
- **request.ts**: Low-level request handling with axios

### Service Modules
- **AuthService.ts**: Authentication-related endpoints (login, register, OTP verification)
- **PdfService.ts**: PDF generation endpoints
- **ResumeService.ts**: Resume upload and parsing endpoints

## Custom API Wrapper Implementation

The project includes a custom wrapper implementation in `app/api/client.ts` that provides:
- A unified API client class with common functionality
- Service integration for easy access
- Authorization token management
- Request/response customization

### Key Features of the Wrapper

#### ApiClient Class
- Base class that handles common HTTP operations (GET, POST, PUT, PATCH, DELETE)
- Configurable base URL and headers
- Built-in authorization header management

#### ApiClientWithServices Class
- Extends ApiClient with direct service access
- Provides easy access to generated services (auth, pdf, etc.)
- Automatically configures the OpenAPI client with the correct base URL

## Using Generated APIs in Your Components

### Authentication Service Examples

#### Login Implementation
```typescript
import { authService } from "@/app/api/client";

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authService.postAuthLogin({
      requestBody: { 
        email, 
        password 
      },
    });
    
    // Handle successful login
    console.log("Login successful:", response);
    
    // Store the token in your auth context/state
    // apiClient.setAuthToken(response.token); // if token is returned
    
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
```

#### Registration Implementation
```typescript
import { authService } from "@/app/api/client";

const handleRegister = async (userData: {
  email: string;
  password: string;
  name: string;
  userType?: 'user' | 'admin';
  jobTitle?: string;
}) => {
  try {
    const response = await authService.postAuthRegister({
      requestBody: userData,
    });
    
    console.log("Registration successful:", response);
    return response;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};
```

#### OTP Verification
```typescript
import { authService } from "@/app/api/client";

const verifyOTP = async (email: string, otp: string) => {
  try {
    const response = await authService.postAuthVerifyOtp({
      requestBody: { 
        email, 
        otp 
      },
    });
    
    console.log("OTP verification successful:", response);
    return response;
  } catch (error) {
    console.error("OTP verification failed:", error);
    throw error;
  }
};
```

### PDF Generation Service Example

```typescript
import { apiClient } from "@/app/api/client";

const generatePDF = async (resumeData: any) => {
  try {
    const response = await apiClient.pdf.postGeneratePdf({
      requestBody: resumeData,
    });
    
    // Handle the returned PDF blob
    return response;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};
```

### Resume Service Example

```typescript
import { apiClient } from "@/app/api/client";

const uploadResume = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.pdf.postUpload({
      formData: { file },
    });
    
    console.log("Resume uploaded and parsed:", response);
    return response;
  } catch (error) {
    console.error("Resume upload failed:", error);
    throw error;
  }
};
```

## Authorization Management

The wrapper provides convenient methods for managing authorization tokens:

```typescript
// Set authorization token
apiClient.setAuthToken("your-jwt-token-here");

// Clear authorization token (logout)
apiClient.clearAuthToken();

// The token is automatically applied to all API requests
```

## Integration in Login Form Component

Here's an example of how to use the generated API in your login form:

```typescript
'use client';

import { useState } from 'react';
import { authService, apiClient } from '@/app/api/client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.postAuthLogin({
        requestBody: { 
          email, 
          password 
        },
      });

      // Assuming the response contains a token
      if (response.token) {
        apiClient.setAuthToken(response.token);
        
        // Redirect to dashboard or wherever appropriate
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks to handle potential errors gracefully
2. **Loading States**: Use loading indicators to improve user experience during API calls
3. **Token Management**: Properly store and manage authentication tokens
4. **Type Safety**: Leverage the generated TypeScript types for better development experience
5. **Cleanup**: Clear authentication tokens on logout to prevent unauthorized access

## Purpose

This script automates the process of creating API clients from OpenAPI specifications, eliminating the need for manual code creation and ensuring that frontend code stays synchronized with the backend API contracts.

## How It Works

### Input Sources

The script accepts an OpenAPI specification source through one of two methods:

1. **Environment Variable**: `NEXT_PUBLIC_OPENAPI_URL` (set in `.env` file)
2. **Command-Line Argument**: Pass the URL/path as a parameter to the script

### URL Normalization

When a URL is provided, the script performs normalization:
- Removes trailing slashes
- Converts `/docs` endpoints to `/docs.json` if needed

### Remote Spec Fetching

For HTTP/HTTPS URLs, the script attempts to fetch the OpenAPI specification from multiple possible endpoints:

1. `{baseUrl}.json`
2. `{baseUrl}/docs.json`
3. `{baseUrl}/swagger.json`
4. `{baseUrl}/openapi.json`

### Temporary File Handling

When fetching remote specs, the script:
- Downloads the spec to a temporary file: `.openapi-spec.json`
- Uses this file as input for the code generator
- Automatically cleans up the temporary file after generation

### Code Generation Process

The script uses `openapi-typescript-codegen` with the following configurations:

- **Client Library**: Axios-based client
- **Options Pattern**: Uses `--useOptions` flag for request configuration
- **Union Types**: Uses `--useUnionTypes` flag for better type discrimination
- **Output Directory**: `app/api/generated/`

### Output Location

Generated API client code is placed in:
```
app/api/generated/
```

## Usage

### Prerequisites

- Node.js and npm installed
- Access to an OpenAPI/Swagger specification
- Network access (for remote specs)

### Environment Variable Method

1. Set the URL in your `.env` file:
   ```
   NEXT_PUBLIC_OPENAPI_URL=http://localhost:5000/api/v1/docs
   ```

2. Run the generation command:
   ```bash
   npm run generate
   ```

### Command-Line Argument Method

Pass the URL directly as an argument:

```bash
npm run generate -- http://localhost:5000/api/v1/docs
```

### Multiple Arguments

You can also pass the URL via command-line arguments with flags:

```bash
NEXT_PUBLIC_OPENAPI_URL="http://localhost:5000/api/v1/docs" npm run generate
```

## Configuration Options

The script uses the following `openapi-typescript-codegen` options:

| Option | Description |
|--------|-------------|
| `--client axios` | Generates an Axios-based client |
| `--useOptions` | Uses options objects for request parameters |
| `--useUnionTypes` | Generates union types for better type safety |

## Benefits

- **Type Safety**: Full TypeScript support with interface definitions
- **Auto-completion**: IDE support for all API endpoints and parameters
- **Maintainability**: Automatically updates when API changes
- **Reduced Errors**: Compile-time checking of API usage
- **Consistency**: Uniform API client implementation

## Troubleshooting

### Common Issues

1. **Npx Not Found**
   - Ensure Node.js and npm are properly installed
   - Check that Node.js is in your system PATH

2. **Spec Fetching Failures**
   - Verify the URL is accessible
   - Check that the endpoint returns valid OpenAPI JSON
   - Confirm CORS policies allow client-side requests (if applicable)

3. **Generation Failures**
   - Validate the OpenAPI spec format
   - Check for syntax errors in the specification

### Logging

The script provides verbose logging during the generation process:
- Shows attempted URLs when fetching specs
- Reports successful fetches
- Displays generation progress
- Shows error messages when failures occur

## Integration Notes

- The generated client integrates seamlessly with Next.js projects
- Axios configuration can be customized in the generated base files
- Models are automatically typed and exported for use in components
- API endpoints follow the same structure as the original OpenAPI specification
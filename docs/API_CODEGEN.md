# API Client Generation Documentation

## Overview

The `scripts/generate-api.js` script is a Node.js utility that automatically generates a typed frontend client from a Swagger/OpenAPI specification. It uses the `openapi-typescript-codegen` tool to create API clients with TypeScript type definitions for improved developer experience and type safety.

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

## Error Handling

The script includes comprehensive error handling:

1. **Network Issues**: Times out requests after 10 seconds
2. **Invalid Specs**: Checks for proper OpenAPI/swagger JSON structure
3. **Missing Dependencies**: Verifies that `npx` is available
4. **File System Errors**: Ensures output directories exist and inputs are valid

## Generated Files Structure

After successful execution, the script creates the following structure in `app/api/generated/`:

```
app/api/generated/
├── apis/           # API endpoint classes
├── models/         # Type definitions for request/response models  
├── base.ts         # Base configuration and interfaces
└── index.ts        # Exports for easy import
```

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
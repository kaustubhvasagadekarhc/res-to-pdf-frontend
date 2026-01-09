# Docker Setup for Frontend

This document explains how to build and run the frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Building the Docker Image

### Option 1: Using Docker directly

```bash
# Build the image
docker build -t res-to-pdf-frontend .

# Run the container
docker run -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-backend-url:4000 \
  res-to-pdf-frontend
```

### Option 2: Using Docker Compose

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Environment Variables

You can set environment variables when running the container in several ways:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:4000)
- `NODE_ENV`: Environment (default: production)

### Method 1: Using -e flag (Inline)

```bash
docker run -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:4000 \
  -e NODE_ENV=production \
  res-to-pdf-frontend
```

### Method 2: Using --env-file (Recommended)

1. Create a `.env` file in the project root:
```bash
# .env
NEXT_PUBLIC_API_URL=http://backend:4000
NODE_ENV=production
```

2. Run with env file:
```bash
docker run -p 3001:3000 \
  --env-file .env \
  res-to-pdf-frontend
```

### Method 3: Using Docker Compose with .env file

1. Create a `.env` file in the same directory as `docker-compose.yml`:
```bash
# .env
NEXT_PUBLIC_API_URL=http://backend:4000
NODE_ENV=production
```

2. Docker Compose will automatically load the `.env` file:
```bash
docker-compose up -d
```

### Method 4: Using Docker Compose with environment section

You can also define environment variables directly in `docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://backend:4000
  - NODE_ENV=production
```

### Important Notes:

- **Next.js Environment Variables**: Variables starting with `NEXT_PUBLIC_` are exposed to the browser and must be set at build time or runtime.
- **Security**: Never commit `.env` files with sensitive data. Use `.env.example` as a template.
- **Build-time vs Runtime**: Some variables need to be available at build time. For those, use `ARG` in Dockerfile or set them during `docker build`.

## Accessing the Application

Once the container is running, access the application at:
- http://localhost:3001

## Building for Production

The Dockerfile uses a multi-stage build process:

1. **Deps stage**: Installs all dependencies
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Creates a minimal production image with only necessary files

This results in a smaller, more efficient production image.

## Troubleshooting

### Port already in use
If port 3001 is already in use, change the port mapping:
```bash
docker run -p 3002:3000 res-to-pdf-frontend
```

### Build fails
Make sure you have all necessary files in the project directory, especially:
- `package.json`
- `package-lock.json`
- All source files

### Container exits immediately
Check the logs:
```bash
docker logs res-to-pdf-frontend
```

## Sharing the Image

### Save image to file:
```bash
docker save res-to-pdf-frontend -o res-to-pdf-frontend.tar
```

### Load image from file:
```bash
docker load -i res-to-pdf-frontend.tar
```

### Push to Docker Hub:
```bash
# Tag the image
docker tag res-to-pdf-frontend your-username/res-to-pdf-frontend:latest

# Push to Docker Hub
docker push your-username/res-to-pdf-frontend:latest
```


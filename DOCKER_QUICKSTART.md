# Docker Quick Start Guide

## Prerequisites
- Docker installed on your system
- Docker Compose installed (optional, but recommended)

## Method 1: Using Docker Compose (Easiest)

### Step 1: Create .env file (if not exists)
```bash
# Create .env file with your configuration
cat > .env << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NODE_ENV=production
EOF
```

### Step 2: Build and Run
```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Step 3: Access the Application
Open your browser and go to: **http://localhost:3001**

---

## Method 2: Using Docker Commands

### Step 1: Build the Docker Image
```bash
# Navigate to the frontend directory
cd res-to-pdf-frontend

# Build the image
docker build -t res-to-pdf-frontend .
```

### Step 2: Create .env file (optional)
```bash
# Create .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env
echo "NODE_ENV=production" >> .env
```

### Step 3: Run the Container

**Option A: With .env file**
```bash
docker run -d \
  --name res-to-pdf-frontend \
  -p 3001:3000 \
  --env-file .env \
  res-to-pdf-frontend
```

**Option B: With inline environment variables**
```bash
docker run -d \
  --name res-to-pdf-frontend \
  -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:4000 \
  -e NODE_ENV=production \
  res-to-pdf-frontend
```

### Step 4: Check Container Status
```bash
# Check if container is running
docker ps

# View logs
docker logs res-to-pdf-frontend

# Follow logs in real-time
docker logs -f res-to-pdf-frontend
```

### Step 5: Access the Application
Open your browser and go to: **http://localhost:3001**

### Step 6: Stop and Remove Container
```bash
# Stop the container
docker stop res-to-pdf-frontend

# Remove the container
docker rm res-to-pdf-frontend
```

---

## Common Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### View Container Logs
```bash
# Using docker-compose
docker-compose logs -f

# Using docker
docker logs -f res-to-pdf-frontend
```

### Restart Container
```bash
# Using docker-compose
docker-compose restart

# Using docker
docker restart res-to-pdf-frontend
```

### Rebuild After Code Changes
```bash
# Using docker-compose
docker-compose up -d --build

# Using docker
docker build -t res-to-pdf-frontend .
docker stop res-to-pdf-frontend
docker rm res-to-pdf-frontend
docker run -d --name res-to-pdf-frontend -p 3001:3000 --env-file .env res-to-pdf-frontend
```

### Execute Commands Inside Container
```bash
docker exec -it res-to-pdf-frontend sh
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker logs res-to-pdf-frontend

# Check if port is already in use
netstat -an | grep 3001
```

### Port already in use
Change the port mapping in docker-compose.yml:
```yaml
ports:
  - "3002:3000"  # Use 3002 instead of 3001
```

Or in docker run command:
```bash
docker run -d -p 3002:3000 --env-file .env res-to-pdf-frontend
```

### Rebuild from scratch
```bash
# Remove old image and containers
docker-compose down
docker rmi res-to-pdf-frontend

# Rebuild
docker-compose up -d --build
```

---

## Quick Reference

| Task | Docker Compose | Docker Command |
|------|---------------|----------------|
| Build & Start | `docker-compose up -d` | `docker build -t res-to-pdf-frontend .`<br>`docker run -d -p 3001:3000 --env-file .env res-to-pdf-frontend` |
| View Logs | `docker-compose logs -f` | `docker logs -f res-to-pdf-frontend` |
| Stop | `docker-compose down` | `docker stop res-to-pdf-frontend` |
| Restart | `docker-compose restart` | `docker restart res-to-pdf-frontend` |
| Rebuild | `docker-compose up -d --build` | `docker build -t res-to-pdf-frontend .` |


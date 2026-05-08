# Mini CRM

Mini CRM is an internal sales management app for customers, orders, and simple revenue reporting.

## Stack

- Backend: Node.js, Express, TypeScript, MySQL, `mysql2/promise`
- Auth: JWT, bcrypt
- Validation: `express-validator`
- Frontend: React, Vite, Tailwind CSS
- Container: Docker Compose with MySQL, backend, and frontend services

## Project Structure

```text
backend/
  src/
    application/   # use cases and ports
    domain/        # entities and domain helpers
    infrastructure/# MySQL repositories, security adapters
    interfaces/    # HTTP controllers, routes, middleware
frontend/
  src/
    api/
    components/
    context/
    pages/
docker-compose.yml
```

## Environment Variables

Backend reads variables from process env or `backend/.env`.

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mini_crm
DB_CONNECTION_LIMIT=10
JWT_SECRET=your_long_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Frontend reads:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Local Setup

Install backend dependencies:

```powershell
cd backend
npm install
```

Install frontend dependencies:

```powershell
cd frontend
npm install
```

Run database migration after MySQL is running:

```powershell
cd backend
npm run migrate
```

Start backend:

```powershell
cd backend
npm run dev
```

Start frontend:

```powershell
cd frontend
$env:ESBUILD_WORKER_THREADS="0"
npm run dev
```

Open:

```text
http://localhost:5173
```

## Docker Setup

Install Docker Desktop first, then run from project root:

```powershell
$env:JWT_SECRET="your_long_secret"
docker compose up --build
```

Run migrations inside the backend container:

```powershell
docker compose exec backend npm run migrate
```

Docker URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api`
- MySQL: `localhost:3306`

## API Summary

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Customers:

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id` admin only

Orders:

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id` admin only

Dashboard:

- `GET /api/dashboard/summary`

## Smoke Test

Create an admin:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"name":"Admin User","email":"admin@example.com","password":"password123","role":"admin"}'
```

Then sign in at `http://localhost:5173/login`.

## Demo

Demo URL: pending deployment.

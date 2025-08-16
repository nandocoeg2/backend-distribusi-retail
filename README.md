# Backend Distribusi Retail

This is the backend for a retail distribution application, built with Fastify, Prisma, TypeScript, Redis, and PostgreSQL.

## Features

- User authentication (register, login, logout)
- JWT-based session management
- Caching with Redis
- Structured logging with Winston
- Request validation with Zod
- Dockerized environment for easy setup

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/backend-distribusi-retail.git
   cd backend-distribusi-retail
   ```

2. Create a `.env` file in the root directory and add the following environment variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
   REDIS_URL="redis://localhost:6379"

   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN="15m"

   JWT_REFRESH_SECRET="your-jwt-refresh-secret"
   JWT_REFRESH_EXPIRES_IN="7d"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### With Docker

To run the application with Docker, use the following command:

```bash
docker-compose up -d
```

This will start the application, PostgreSQL, and Redis in detached mode.

#### Locally

To run the application locally, first make sure you have PostgreSQL and Redis running on your machine. Then, run the following commands:

```bash
# Apply database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## API Documentation

The API documentation is available via Swagger at `http://localhost:3000/docs`.

### Authentication

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in a user and get an access token.
- `POST /api/auth/logout`: Log out a user.

### Users

- `GET /api/users`: Get all users (requires authentication).
- `GET /api/users/:id`: Get a user by ID (requires authentication).
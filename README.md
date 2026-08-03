# TaskFlow Backend

REST API backend for TaskFlow — a personal todo app with email deadline reminders.

## Features

- **JWT Authentication** — Register/login with secure token-based auth
- **Task CRUD** — Create, read, update, delete your personal tasks
- **Deadline Tracking** — Set deadlines on tasks with validation
- **Email Reminders** — Automated email notifications via Resend API for tasks approaching their deadline (within 24 hours)
- **Cron Scheduler** — Hourly background job checks for upcoming deadlines
- **Duplicate Prevention** — Each task only triggers one reminder email
- **Validation** — Request validation with express-validator
- **API Docs** — Swagger UI documentation
- **Layered Architecture** — Routes → Controllers → Services → Repositories → Models

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Resend (email API)
- node-cron (job scheduling)
- express-validator
- Swagger UI

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Resend API key ([resend.com](https://resend.com))

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow_db
JWT_SECRET=YOUR_SUPER_SECRET_KEY
JWT_EXPIRES_IN=1d

# Email (Resend API)
RESEND_API_KEY=re_your_api_key_here
```

## Local Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Or start normally
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |

### Tasks (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | Get all your tasks |
| GET | `/api/v1/tasks/:id` | Get a single task |
| POST | `/api/v1/tasks` | Create a new task |
| PUT | `/api/v1/tasks/:id` | Update a task |
| DELETE | `/api/v1/tasks/:id` | Delete a task |

## Email Notification System

The backend runs an hourly cron job that:
1. Finds all non-completed tasks with deadlines within the next 24 hours
2. Groups them by user
3. Sends a styled HTML reminder email to each user via Resend API
4. Marks tasks as reminded to prevent duplicate emails

## API Docs

Swagger UI available at: `http://localhost:5000/api-docs`

## Project Structure

```
src/
├── config/         # DB connection, cron jobs
├── controllers/    # Route handlers
├── middlewares/     # Auth middleware
├── models/         # Mongoose schemas (User, Task)
├── repositories/   # Database queries
├── routes/         # API routes
├── services/       # Business logic, email, notifications
├── utils/          # Error handling utilities
├── validators/     # Request validation
├── app.js          # Express app setup
└── server.js       # Entry point
```

## Related Repo

Frontend: [TaskFlow Frontend](https://github.com/Amitkumarpatwa/Task-flow.git)

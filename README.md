# TaskFlow Backend

REST API backend for TaskFlow — a personal todo app with email deadline reminders.

## Features

- **JWT Authentication** — Register/login with secure token-based auth
- **Task CRUD** — Create, read, update, delete your personal tasks
- **Deadline Tracking** — Set deadlines on tasks with validation & urgency statuses
- **Automated Email Reminders** — Email notifications via Resend API for tasks due within 24 hours
- **Vercel Serverless Cron Jobs** — Scheduled `/api/v1/cron/check-deadlines` endpoint configured via `vercel.json`
- **Instant Deadline Checks** — Non-blocking background checks executed upon task creation/update
- **Duplicate Prevention** — Each task only triggers one reminder email (`emailReminderSent` flag)
- **Validation** — Request validation with `express-validator`
- **API Docs** — Swagger UI documentation
- **Layered Architecture** — Routes → Controllers → Services → Repositories → Models

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Resend (Email API)
- Vercel Serverless Cron Jobs & `node-cron`
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

### Cron (Serverless / Scheduled)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cron/check-deadlines` | Triggered by Vercel Cron Jobs or scheduled workers |

## Email Notification System

The backend features a multi-tiered deadline reminder system:
1. **Serverless Cron Jobs (Production)**: Vercel triggers `/api/v1/cron/check-deadlines` every hour.
2. **Instant Checks**: Tasks created or updated with a deadline within 24 hours trigger an immediate background check.
3. **Email Delivery**: Uses Resend API to send HTML reminder emails with urgency labels and task summaries.
4. **Deduplication**: Automatically marks tasks with `emailReminderSent = true` to prevent duplicate emails.

## API Docs

Swagger UI available at: `http://localhost:5000/api-docs`

## Project Structure

```
src/
├── config/         # DB connection, cron jobs
├── controllers/    # Route handlers
├── middlewares/    # Auth & error middlewares
├── models/         # Mongoose schemas (User, Task)
├── repositories/   # Database access layer
├── routes/         # API endpoints (Auth, Tasks, Cron)
├── services/       # Business logic, email, notifications
├── utils/          # AppError & catchAsync helpers
└── validators/     # Express validator rules
```

## Related Repo

Frontend: [TaskFlow Frontend](https://github.com/Amitkumarpatwa/Task-flow.git)

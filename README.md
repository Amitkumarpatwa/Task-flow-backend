# Task Flow Backend

This repository contains the Node.js + Express backend API for Task Flow.

Frontend repository:
https://github.com/Amitkumarpatwa/Task-flow.git

## Features
- JWT authentication (register/login)
- Role-based authorization (user/admin)
- Task CRUD APIs
- Validation with express-validator
- Swagger API documentation
- Layered architecture (routes/controllers/services/repositories/models)

## Tech Stack
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Swagger UI

## Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

## Environment Variables
Create a .env file in the project root:

PORT=5000
MONGO_URI=mongodb://localhost:27017/internship_db
JWT_SECRET=YOUR_SUPER_SECRET_KEY
JWT_EXPIRES_IN=1d

## Local Setup
1. Install dependencies:
   npm install
2. Start in development mode:
   npm run dev
3. Or start normally:
   npm start

## API Base Path
- Base URL: http://localhost:5000/api/v1
- Swagger UI: http://localhost:5000/api-docs

## Related Repo
Frontend UI:
https://github.com/Amitkumarpatwa/Task-flow.git

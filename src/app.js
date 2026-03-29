const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const authRoutes = require('./routes/api/v1/authRoutes');
const taskRoutes = require('./routes/api/v1/taskRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Implement CORS
app.use(cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny')); // Avoid breaking logs if prod
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 2) SWAGGER API DOCS
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3) ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Handle unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;

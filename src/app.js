const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiter');
const ApiError = require('./utils/apiError');
const config = require('./config');

const app = express();

//Security HTTP headers with cross-origin resource policy for uploaded images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

//CORS configuration limited to client origin with credentials //config.clientUrl
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// app.use(cors());

// Request logging in development
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

//
// app.use('/test', (req, res) => {
//   res.json({ message: 'Hello World!' });
// });

// Serve static uploaded media files
app.use('/uploads', express.static(path.resolve('public', 'uploads')));

// General API rate limiter
app.use('/api', apiLimiter);

// API v1 Master routes
app.use('/api/v1', routes);

// Catch 404
app.use((req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} not found`));
});

// Central error handler
app.use(errorHandler);

module.exports = app;

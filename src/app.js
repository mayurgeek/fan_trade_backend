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

// Trust reverse proxies (Render, Cloudflare, AWS ALB) for secure cookies and protocol detection
app.set('trust proxy', 1);

// Security HTTP headers with cross-origin resource policy for uploaded images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Determine allowed CORS origins (support multiple URLs, strip trailing slashes, allow onrender.com)
const rawClientUrls = (process.env.CLIENT_URL || config.clientUrl || '').split(',');
const allowedOrigins = new Set(
  [
    ...rawClientUrls,
    'https://fan-trade-frontend.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]
    .map((url) => url && url.trim().replace(/\/+$/, ''))
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalized = origin.trim().replace(/\/+$/, '');
      if (
        allowedOrigins.has(normalized) ||
        normalized.endsWith('.onrender.com') ||
        config.env !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'x-access-token',
      'x-refresh-token',
    ],
    exposedHeaders: ['Set-Cookie'],
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

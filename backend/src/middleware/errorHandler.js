// Centralized Error Handling Middleware

function errorHandler(err, req, res, next) {
  console.error('[Error Stack]:', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

/**
 * Centralized error handler for API requests
 * 
 * @param {Error} error - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const errorHandler = (error, req, res) => {
  console.error(`Error processing request ${req.method} ${req.path}:`, error);
  
  // Determine appropriate HTTP status code
  let statusCode = 500;
  let message = 'Internal server error';
  
  // Customize based on error type
  if (error.name === 'ValidationError') {
    statusCode = 400; // Bad request
    message = error.message || 'Validation error';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404; // Not found
    message = error.message || 'Resource not found';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401; // Unauthorized
    message = error.message || 'Unauthorized access';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403; // Forbidden
    message = error.message || 'Access forbidden';
  }
  
  // Return error response to client
  res.status(statusCode).json({
    error: {
      message,
      code: error.code || 'SERVER_ERROR',
      // Include stack trace in development but not production
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    }
  });
};

export default errorHandler;
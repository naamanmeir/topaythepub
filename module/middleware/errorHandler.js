/**
 * Error Handling Middleware
 * Provides consistent error handling across the application
 */

const config = require('../../config');

/**
 * Custom Application Error
 * Used for operational errors with specific status codes
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Global Error Handler Middleware
 * Handles all errors and sends consistent responses
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Convert known errors to AppError
    if (err.name === 'ValidationError') {
        error = new AppError('Validation failed', 400);
    } else if (err.code === 'ER_DUP_ENTRY') {
        error = new AppError('Duplicate entry - record already exists', 409);
    } else if (err.code === 'ER_NO_REFERENCED_ROW') {
        error = new AppError('Referenced record does not exist', 400);
    } else if (err.name === 'UnauthorizedError') {
        error = new AppError('Unauthorized access', 401);
    } else if (!err.statusCode) {
        error.statusCode = 500;
        error.isOperational = false;
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';

    // Log error
    const logError = {
        message: error.message,
        statusCode: statusCode,
        url: req.url,
        method: req.method,
        ip: req.headers['x-forwarded-for'] || req.ip,
        userId: req.session?.userid || 'anonymous',
        timestamp: new Date().toISOString()
    };

    // Only log stack for non-operational errors or server errors
    if (!error.isOperational || statusCode >= 500) {
        logError.stack = error.stack;
        
        // Use global error logger if available
        if (global.errorLogger) {
            global.errorLogger.error(logError);
        } else {
            console.error('Error:', logError);
        }
    }

    // Send response
    const response = {
        success: false,
        error: config.app.isProduction && !error.isOperational 
            ? 'Internal server error' 
            : message
    };

    // Include stack trace in development
    if (config.app.isDevelopment) {
        response.stack = error.stack;
        response.details = logError;
    }

    res.status(statusCode).json(response);
}

/**
 * 404 Not Found Handler
 * Handles routes that don't exist
 */
function notFoundHandler(req, res, next) {
    const error = new AppError(
        `Route not found: ${req.method} ${req.url}`,
        404
    );
    next(error);
}

module.exports = {
    AppError,
    asyncHandler,
    errorHandler,
    notFoundHandler
};

/**
 * Response Helper
 * Standardizes API responses across all routes
 */

class ResponseHelper {
    /**
     * Send success response
     * @param {Object} res - Express response object
     * @param {*} data - Data to send
     * @param {string} message - Optional success message
     * @returns {Object} Express response
     */
    static success(res, data, message = null) {
        const response = {
            success: true,
            data: data
        };

        if (message) {
            response.message = message;
        }

        return res.json(response);
    }

    /**
     * Send error response
     * @param {Object} res - Express response object
     * @param {string} errorMessage - Error message
     * @param {number} statusCode - HTTP status code
     * @returns {Object} Express response
     */
    static error(res, errorMessage, statusCode = 400) {
        return res.status(statusCode).json({
            success: false,
            error: errorMessage,
            data: null
        });
    }

    /**
     * Send not found response
     * @param {Object} res - Express response object
     * @param {string} message - Not found message
     * @returns {Object} Express response
     */
    static notFound(res, message = 'Resource not found') {
        return res.status(404).json({
            success: false,
            error: message,
            data: null
        });
    }

    /**
     * Send unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Unauthorized message
     * @returns {Object} Express response
     */
    static unauthorized(res, message = 'Unauthorized') {
        return res.status(401).json({
            success: false,
            error: message,
            data: null
        });
    }

    /**
     * Send forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Forbidden message
     * @returns {Object} Express response
     */
    static forbidden(res, message = 'Forbidden') {
        return res.status(403).json({
            success: false,
            error: message,
            data: null
        });
    }

    /**
     * Send server error response
     * @param {Object} res - Express response object
     * @param {Error} error - Error object
     * @param {string} message - User-friendly message
     * @returns {Object} Express response
     */
    static serverError(res, error, message = 'Internal server error') {
        // Log error if logger is available
        if (global.errorLogger) {
            global.errorLogger.error({
                message: error.message,
                stack: error.stack
            });
        } else {
            console.error('Server Error:', error);
        }

        return res.status(500).json({
            success: false,
            error: message,
            data: null
        });
    }

    /**
     * Send validation error response
     * @param {Object} res - Express response object
     * @param {Array} errors - Array of validation error messages
     * @returns {Object} Express response
     */
    static validationError(res, errors) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
            data: null
        });
    }

    /**
     * Send HTML response (for backward compatibility)
     * @param {Object} res - Express response object
     * @param {string} html - HTML content
     * @returns {Object} Express response
     */
    static html(res, html) {
        return res.send(html);
    }

    /**
     * Send plain text response
     * @param {Object} res - Express response object
     * @param {string} text - Plain text
     * @returns {Object} Express response
     */
    static text(res, text) {
        return res.send(text);
    }
}

module.exports = ResponseHelper;

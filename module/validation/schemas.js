/**
 * Validation Schemas
 * Centralized request validation using express-validator
 * 
 * Install: npm install express-validator
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Hebrew and English alphanumeric pattern
 * Supports Hebrew characters (א-ת), English (a-zA-Z), numbers, and spaces
 */
const hebrewEnglishPattern = /^[a-zA-Z0-9\u0590-\u05FF\s]+$/;

/**
 * Validation rules for different request types
 * Each validator is an array of express-validator rules
 */
const validators = {
    /**
     * Client login validation
     */
    clientLogin: [
        body('id')
            .isInt({ min: 1, max: 99999 })
            .withMessage('ID must be a number between 1 and 99999')
    ],

    /**
     * Client search validation
     */
    clientSearch: [
        body('name')
            .trim()
            .notEmpty().withMessage('Search name cannot be empty')
            .isLength({ min: 1, max: 40 }).withMessage('Search name must be between 1 and 40 characters')
            .matches(hebrewEnglishPattern).withMessage('Search name can only contain Hebrew, English, numbers, and spaces')
    ],

    /**
     * Order creation validation
     */
    orderCreate: [
        body('userId')
            .isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
        body('order')
            .isObject().withMessage('Order must be an object')
            .custom((value) => {
                if (!value || Object.keys(value).length === 0) {
                    throw new Error('Order must contain at least one item');
                }
                // Validate each order item
                for (const [itemId, quantity] of Object.entries(value)) {
                    if (!Number.isInteger(Number(itemId))) {
                        throw new Error(`Invalid item ID: ${itemId}`);
                    }
                    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                        throw new Error(`Quantity for item ${itemId} must be between 1 and 99`);
                    }
                }
                return true;
            })
    ],

    /**
     * Client update (change nickname) validation
     */
    clientUpdate: [
        body('id')
            .isInt({ gt: 0 }).withMessage('ID must be a positive integer'),
        body('newNick')
            .trim()
            .notEmpty().withMessage('Nickname cannot be empty')
            .isLength({ min: 1, max: 40 }).withMessage('Nickname must be between 1 and 40 characters')
            .matches(hebrewEnglishPattern).withMessage('Nickname can only contain Hebrew, English, numbers, and spaces')
    ],

    /**
     * Client creation validation
     */
    clientCreate: [
        body('name')
            .trim()
            .notEmpty().withMessage('Client name cannot be empty')
            .isLength({ min: 1, max: 99 }).withMessage('Client name must be between 1 and 99 characters')
            .matches(hebrewEnglishPattern).withMessage('Client name can only contain Hebrew, English, numbers, and spaces'),
        body('nick')
            .trim()
            .notEmpty().withMessage('Nickname cannot be empty')
            .isLength({ min: 1, max: 40 }).withMessage('Nickname must be between 1 and 40 characters')
            .matches(hebrewEnglishPattern).withMessage('Nickname can only contain Hebrew, English, numbers, and spaces'),
        body('account')
            .isInt().withMessage('Account must be an integer')
    ],

    /**
     * Product creation validation
     */
    productCreate: [
        body('name')
            .trim()
            .notEmpty().withMessage('Product name cannot be empty')
            .isLength({ min: 1, max: 99 }).withMessage('Product name must be between 1 and 99 characters')
            .matches(hebrewEnglishPattern).withMessage('Product name can only contain Hebrew, English, numbers, and spaces'),
        body('price')
            .isInt({ min: 0 }).withMessage('Price must be a non-negative integer'),
        body('stock')
            .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        body('imgpath')
            .isString().withMessage('Image path must be a string')
            .isLength({ max: 1024 }).withMessage('Image path must not exceed 1024 characters'),
        body('order')
            .isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
    ],

    /**
     * Product update validation
     */
    productUpdate: [
        body('id')
            .isInt({ gt: 0 }).withMessage('Product ID must be a positive integer'),
        body('field')
            .isIn(['itemname', 'price', 'stock', 'imgpath', 'order'])
            .withMessage('Invalid field name. Must be one of: itemname, price, stock, imgpath, order'),
        body('value')
            .notEmpty().withMessage('Value cannot be empty')
            .custom((value, { req }) => {
                const field = req.body.field;
                if (field === 'itemname') {
                    if (typeof value !== 'string' || value.length < 1 || value.length > 99) {
                        throw new Error('Product name must be between 1 and 99 characters');
                    }
                    if (!hebrewEnglishPattern.test(value)) {
                        throw new Error('Product name can only contain Hebrew, English, numbers, and spaces');
                    }
                } else if (field === 'price' || field === 'stock' || field === 'order') {
                    const num = Number(value);
                    if (!Number.isInteger(num) || num < 0) {
                        throw new Error(`${field} must be a non-negative integer`);
                    }
                } else if (field === 'imgpath') {
                    if (typeof value !== 'string' || value.length > 1024) {
                        throw new Error('Image path must be a string and not exceed 1024 characters');
                    }
                }
                return true;
            })
    ],

    /**
     * Message board post validation
     */
    postCreate: [
        body('post')
            .trim()
            .notEmpty().withMessage('Post content cannot be empty')
            .isLength({ min: 1, max: 1000 }).withMessage('Post must be between 1 and 1000 characters'),
        body('user')
            .trim()
            .notEmpty().withMessage('User name cannot be empty')
            .isLength({ min: 1, max: 40 }).withMessage('User name must not exceed 40 characters')
    ],

    /**
     * User creation validation (admin only)
     */
    userCreate: [
        body('username')
            .trim()
            .isAlphanumeric().withMessage('Username must be alphanumeric')
            .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('class')
            .isInt().withMessage('User class must be an integer')
            .isIn([0, 50, 75, 100, 120]).withMessage('User class must be one of: 0 (admin), 50 (manager), 75 (accountant), 100 (staff), 120 (remote)')
    ],

    /**
     * Generic ID validation
     */
    deleteById: [
        body('id')
            .isInt({ gt: 0 }).withMessage('ID must be a positive integer')
    ],

    /**
     * Post pin/delete validation
     */
    postAction: [
        body('postid')
            .isInt({ gt: 0 }).withMessage('Post ID must be a positive integer')
    ]
};

/**
 * Validation middleware factory
 * Creates middleware that validates request body using express-validator
 * 
 * @param {Array} validatorArray - Array of express-validator validation rules
 * @returns {Array} Array of middleware functions
 */
function validate(validatorArray) {
    return [
        // Spread the validation rules
        ...validatorArray,
        // Error handling middleware
        (req, res, next) => {
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(e => e.msg);
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errorMessages,
                    data: null
                });
            }
            
            // Store validated data (already sanitized by express-validator)
            req.validatedBody = req.body;
            next();
        }
    ];
}

/**
 * Validate URL parameters
 * Used for routes that pass data in URL params like /route/:data
 * 
 * @param {Array} validatorArray - Array of express-validator validation rules for params
 * @param {string} paramName - Name of the param to validate (default: 'data')
 * @returns {Array} Array of middleware functions
 */
function validateParam(validatorArray, paramName = 'data') {
    return [
        // Parse JSON from URL parameter first
        (req, res, next) => {
            try {
                req.body = JSON.parse(req.params[paramName]);
                next();
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid parameter format. Expected valid JSON.',
                    data: null
                });
            }
        },
        // Then apply validation rules
        ...validatorArray,
        // Error handling
        (req, res, next) => {
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(e => e.msg);
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errorMessages,
                    data: null
                });
            }
            
            req.validatedParam = req.body;
            next();
        }
    ];
}

module.exports = {
    validators,
    validate,
    validateParam
};

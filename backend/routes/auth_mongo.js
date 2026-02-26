const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthUtils = require('../utils/authUtils');
const { authRateLimit } = require('../middleware/auth_mongo');
const {
  User,
  UserPreference
} = require('../db_mongo');

const router = express.Router();

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', [
    authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

        // Validate password strength
        const passwordValidation = AuthUtils.validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: passwordValidation.message,
                requirements: passwordValidation.requirements
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const passwordHash = await AuthUtils.hashPassword(password);

        // Create user
        const newUser = new User({
            email: email,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            date_of_birth: dateOfBirth,
            role: 'customer',
            is_active: true,
            email_verified: false
        });

        const savedUser = await newUser.save();

        // Create default user preferences
        const userPreference = new UserPreference({
            user_id: savedUser._id,
            preferred_spice_level: 'medium'
        });

        await userPreference.save();

        // Generate JWT token
        const token = AuthUtils.generateToken({
            userId: savedUser._id.toString(),
            email: savedUser.email
        });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: savedUser._id,
                    email: savedUser.email,
                    firstName: savedUser.first_name,
                    lastName: savedUser.last_name,
                    createdAt: savedUser.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed. Please try again later.'
        });
    }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', [
    // Temporarily disable rate limiting for development
    // authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                status: 'error',
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await AuthUtils.comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        // Generate JWT token
        const token = AuthUtils.generateToken({
            userId: user._id.toString(),
            email: user.email
        });

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Login failed. Please try again later.'
        });
    }
});

/**
 * Password Reset Request
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', [
    authRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email: email, is_active: true });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({
                status: 'success',
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Check rate limiting - don't allow more than one request per 5 minutes
        if (user.last_password_reset_request) {
            const lastRequest = new Date(user.last_password_reset_request);
            const now = new Date();
            const diffMinutes = (now - lastRequest) / (1000 * 60);
            
            if (diffMinutes < 5) {
                return res.status(429).json({
                    status: 'error',
                    message: 'Please wait before requesting another password reset link.'
                });
            }
        }

        // Generate secure reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store token in user document (simplified approach for MongoDB)
        user.password_reset_token = hashedToken;
        user.password_reset_expires = expiresAt;
        user.last_password_reset_request = new Date();
        await user.save();

        // Send password reset email
        const { sendPasswordResetEmail } = require('../utils/emailService');
        const emailResult = await sendPasswordResetEmail(user.email, user.first_name, resetToken);
        
        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            // We still return success to prevent email enumeration
        }

        res.json({
            status: 'success',
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

    } catch (error) {
        console.error('Password reset error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Password reset request failed. Please try again later.'
        });
    }
});

/**
 * Reset Password
 * POST /api/auth/reset-password
 */
router.post('/reset-password', [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token, newPassword } = req.body;
        const crypto = require('crypto');
        
        // Hash the token for comparison
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            password_reset_token: hashedToken,
            password_reset_expires: { $gt: new Date() },
            is_active: true
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset token'
            });
        }

        // Validate password strength
        const passwordValidation = AuthUtils.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: passwordValidation.message,
                requirements: passwordValidation.requirements
            });
        }

        // Hash new password
        const hashedPassword = await AuthUtils.hashPassword(newPassword);

        // Update user password and clear reset token
        user.password_hash = hashedPassword;
        user.password_reset_token = undefined;
        user.password_reset_expires = undefined;
        user.updatedAt = new Date();
        await user.save();

        res.json({
            status: 'success',
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Password reset error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Password reset failed. Please try again later.'
        });
    }
});

/**
 * Validate Email Availability
 * GET /api/auth/validate-email?email=test@example.com
 */
const { query } = require('express-validator');

router.get('/validate-email', [
    query('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
], async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email parameter is required'
            });
        }

        const user = await User.findOne({ email: email });

        res.json({
            status: 'success',
            data: {
                available: !user
            }
        });

    } catch (error) {
        console.error('Email validation error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Email validation failed'
        });
    }
});

module.exports = router;
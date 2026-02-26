const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Authentication Utilities
 * Provides secure authentication functions following security best practices
 */

class AuthUtils {
    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Hashed password
     */
    static async hashPassword(password) {
        try {
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            throw new Error('Password hashing failed');
        }
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} - Match result
     */
    static async comparePassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            throw new Error('Password comparison failed');
        }
    }

    /**
     * Generate JWT token
     * @param {object} payload - Token payload
     * @returns {string} - JWT token
     */
    static generateToken(payload) {
        try {
            const secret = process.env.JWT_SECRET;
            const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
            
            if (!secret) {
                throw new Error('JWT_SECRET not configured');
            }

            return jwt.sign(payload, secret, { expiresIn });
        } catch (error) {
            throw new Error('Token generation failed');
        }
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {object} - Decoded payload
     */
    static verifyToken(token) {
        try {
            const secret = process.env.JWT_SECRET;
            
            if (!secret) {
                throw new Error('JWT_SECRET not configured');
            }

            return jwt.verify(token, secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            } else {
                throw new Error('Token verification failed');
            }
        }
    }

    /**
     * Extract token from Authorization header
     * @param {string} authHeader - Authorization header value
     * @returns {string|null} - Token or null
     */
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} - Validation result
     */
    static validatePasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const isValid = password.length >= minLength && hasUpperCase && 
                       hasLowerCase && hasNumbers && hasSpecialChar;

        return {
            isValid,
            requirements: {
                minLength: password.length >= minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            },
            message: isValid ? 'Password is strong' : 
                'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
        };
    }

    /**
     * Generate secure random password
     * @param {number} length - Password length (default: 12)
     * @returns {string} - Generated password
     */
    static generateSecurePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }
}

module.exports = AuthUtils;
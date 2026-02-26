/**
 * Structured Logging System
 * Provides comprehensive logging with different levels and output formats
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    HTTP: 3,
    DEBUG: 4
};

const LOG_COLORS = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    HTTP: '\x1b[35m',  // Magenta
    DEBUG: '\x1b[37m'  // White
};

const RESET_COLOR = '\x1b[0m';

class Logger {
    constructor() {
        this.currentLevel = process.env.LOG_LEVEL || 'INFO';
        this.logToFile = process.env.LOG_TO_FILE !== 'false';
        this.logToConsole = process.env.LOG_TO_CONSOLE !== 'false';
        
        // Create log files
        this.errorLogPath = path.join(logsDir, 'error.log');
        this.combinedLogPath = path.join(logsDir, 'combined.log');
        this.httpLogPath = path.join(logsDir, 'http.log');
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        return JSON.stringify(logEntry, null, process.env.NODE_ENV === 'development' ? 2 : 0);
    }

    writeToFile(filePath, content) {
        if (this.logToFile) {
            try {
                fs.appendFileSync(filePath, content + '\n');
            } catch (error) {
                console.error('Failed to write to log file:', error.message);
            }
        }
    }

    writeToConsole(level, message, meta = {}) {
        if (this.logToConsole) {
            const color = LOG_COLORS[level] || '';
            const timestamp = new Date().toISOString();
            
            let consoleMessage = `${color}[${timestamp}] ${level}${RESET_COLOR}: ${message}`;
            
            if (Object.keys(meta).length > 0) {
                consoleMessage += `\n${JSON.stringify(meta, null, 2)}`;
            }
            
            console.log(consoleMessage);
        }
    }

    log(level, message, meta = {}) {
        const levelNum = LOG_LEVELS[level];
        const currentLevelNum = LOG_LEVELS[this.currentLevel];
        
        if (levelNum > currentLevelNum) {
            return; // Skip if log level is too verbose
        }

        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Write to console
        this.writeToConsole(level, message, meta);
        
        // Write to files
        this.writeToFile(this.combinedLogPath, formattedMessage);
        
        if (level === 'ERROR') {
            this.writeToFile(this.errorLogPath, formattedMessage);
        }
        
        if (level === 'HTTP') {
            this.writeToFile(this.httpLogPath, formattedMessage);
        }
    }

    error(message, meta = {}) {
        this.log('ERROR', message, meta);
    }

    warn(message, meta = {}) {
        this.log('WARN', message, meta);
    }

    info(message, meta = {}) {
        this.log('INFO', message, meta);
    }

    http(message, meta = {}) {
        this.log('HTTP', message, meta);
    }

    debug(message, meta = {}) {
        this.log('DEBUG', message, meta);
    }

    // Request logging middleware
    requestLogger() {
        return (req, res, next) => {
            const start = Date.now();
            
            // Log request
            this.http('Incoming Request', {
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                user: req.user?.id || 'anonymous'
            });

            // Capture response details
            const originalSend = res.send;
            res.send = function(body) {
                const duration = Date.now() - start;
                
                logger.http('Request Completed', {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    ip: req.ip,
                    user: req.user?.id || 'anonymous'
                });

                return originalSend.call(this, body);
            };

            next();
        };
    }

    // Database operation logging
    dbQuery(query, params = [], duration = null) {
        this.debug('Database Query', {
            query: query.replace(/\s+/g, ' ').trim(),
            params,
            duration: duration ? `${duration}ms` : null
        });
    }

    // Authentication logging
    authAttempt(type, user, success, reason = null) {
        this.info('Authentication Attempt', {
            type,
            user: user?.email || user?.id || 'unknown',
            success,
            reason,
            ip: user?.ip
        });
    }

    // Business operation logging
    businessEvent(event, details = {}) {
        this.info('Business Event', {
            event,
            ...details
        });
    }

    // Performance monitoring
    performance(operation, duration, details = {}) {
        const level = duration > 1000 ? 'WARN' : 'INFO';
        this[level.toLowerCase()]('Performance Metric', {
            operation,
            duration: `${duration}ms`,
            ...details
        });
    }

    // Security event logging
    securityEvent(event, severity = 'INFO', details = {}) {
        const level = severity === 'HIGH' ? 'ERROR' : severity === 'MEDIUM' ? 'WARN' : 'INFO';
        this[level.toLowerCase()]('Security Event', {
            event,
            severity,
            ...details
        });
    }

    // Clean old log files
    cleanOldLogs(daysToKeep = 30) {
        const logFiles = fs.readdirSync(logsDir);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        logFiles.forEach(file => {
            const filePath = path.join(logsDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
                this.info('Cleaned old log file', { file });
            }
        });
    }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

module.exports = logger;
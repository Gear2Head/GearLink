// Error Handling Utilities
export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

// Error codes
export const ErrorCodes = {
    // Firebase
    AUTH_FAILED: 'AUTH_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NETWORK_ERROR: 'NETWORK_ERROR',

    // Upload
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',

    // Capacitor
    CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
    LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',

    // General
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Error handler
export const handleError = (error, context = '') => {
    console.error(`[${context}]`, error);

    // User-friendly messages
    const messages = {
        [ErrorCodes.AUTH_FAILED]: 'Giriş yapılamadı. Lütfen tekrar deneyin.',
        [ErrorCodes.PERMISSION_DENIED]: 'İzin reddedildi. Lütfen ayarlardan izin verin.',
        [ErrorCodes.NETWORK_ERROR]: 'İnternet bağlantınızı kontrol edin.',
        [ErrorCodes.UPLOAD_FAILED]: 'Dosya yüklenemedi. Lütfen tekrar deneyin.',
        [ErrorCodes.FILE_TOO_LARGE]: 'Dosya çok büyük (Max 10MB).',
        [ErrorCodes.CAMERA_PERMISSION_DENIED]: 'Kamera izni gerekli.',
        [ErrorCodes.LOCATION_PERMISSION_DENIED]: 'Konum izni gerekli.',
    };

    const userMessage = messages[error.code] || error.message || 'Bir hata oluştu.';

    return {
        userMessage,
        originalError: error,
        code: error.code || ErrorCodes.UNKNOWN_ERROR,
        context
    };
};

// Async error wrapper
export const withErrorHandling = async (fn, context = '') => {
    try {
        return await fn();
    } catch (error) {
        const handledError = handleError(error, context);
        throw handledError;
    }
};

// Firebase error mapper
export const mapFirebaseError = (error) => {
    const errorMap = {
        'permission-denied': ErrorCodes.PERMISSION_DENIED,
        'unauthenticated': ErrorCodes.AUTH_FAILED,
        'network-request-failed': ErrorCodes.NETWORK_ERROR,
    };

    const code = errorMap[error.code] || ErrorCodes.UNKNOWN_ERROR;
    return new AppError(error.message, code, { originalCode: error.code });
};

// Configuration file for environment-based settings

export const config = {
    // API Configuration
    apiUrl: process.env.REACT_APP_API_URL || '/api',
    
    // Environment
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    isDevelopment: process.env.REACT_APP_ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development',
    isProduction: process.env.REACT_APP_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production',
    
    // Feature flags (can be extended)
    features: {
        enableLogging: process.env.REACT_APP_ENVIRONMENT !== 'production',
        enableDebugMode: process.env.REACT_APP_ENVIRONMENT === 'development',
    },
    
    // File upload constraints
    maxFileSize: 100 * 1024 * 1024, // 100MB in bytes
    allowedFileTypes: ['.obj'],
};

// Helper function to log configuration in development
if (config.isDevelopment) {
    console.log('App Configuration:', config);
}

export default config;

export const config = {
	app: {
		name: import.meta.env.VITE_APP_NAME || 'DRCCS',
		version: import.meta.env.VITE_APP_VERSION || '1.0.0',
		environment: import.meta.env.VITE_ENVIRONMENT || 'development',
	},
	api: {
		baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
		wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
	},
	logging: {
		level: import.meta.env.VITE_LOG_LEVEL || 'info',
	},
	isDevelopment: import.meta.env.DEV,
	isProduction: import.meta.env.PROD,
} as const;

export type Config = typeof config;

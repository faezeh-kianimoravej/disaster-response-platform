/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_VERSION: string;
	readonly VITE_API_BASE_URL: string;
	readonly VITE_WS_URL: string;
	readonly VITE_ENVIRONMENT: string;
	readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

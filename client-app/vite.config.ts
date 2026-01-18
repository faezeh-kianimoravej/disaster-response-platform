/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				// Add runtime caching for API calls
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\/api\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						// Cache all other network requests
						urlPattern: /^https?.*/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'offlineCache',
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
						},
					},
				],
				// Skip waiting and claim clients immediately
				skipWaiting: true,
				clientsClaim: true,
				// Add navigation fallback
				navigateFallback: '/index.html',
				navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
			},
			manifest: {
				id: '/',
				name: 'Disaster Response Crisis Communication System',
				short_name: 'DRCCS',
				description: 'Emergency response management system for crisis coordination',
				theme_color: '#1e40af',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: '/favicon.jpg',
						sizes: '428x393',
						type: 'image/jpeg',
						purpose: 'any'
					}
				],
				categories: ['productivity', 'utilities'],
				lang: 'en',
				orientation: 'any'
			}
		})
	],
	server: {
		port: 3000,
		open: true,
	},
	preview: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			output: {
                manualChunks: {
                    'react-core': ['react', 'react-dom'],
                    'react-router': ['react-router-dom'],
                    'react-hook-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
                    'react-query': ['@tanstack/react-query'],
                    'axios': ['axios'],
                    'lucide': ['lucide-react'],
                    'keycloak': ['keycloak-js'],
                },
			},
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
		include: [
			'src/test/logic/**/*.test.{ts,tsx}',
			'src/test/smoke/**/*.test.{ts,tsx}',
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'cobertura'],
			reportsDirectory: './coverage',
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.test.{ts,tsx}',
				'**/*.config.{ts,js}',
				'coverage/**',
				'build/**',
			],
		},
		// Produce a JUnit report in CI only so local `vitest` UX isn't affected
		reporters: ((): any => {
			const r: any[] = [];
			if (process.env.CI || process.env.GITLAB_CI) {
				r.push(['junit', { outputFile: 'test-results/junit.xml' }]);
			}
			return r;
		})(),
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});

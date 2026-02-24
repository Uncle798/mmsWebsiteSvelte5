import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
	],
	server: {
		allowedHosts: [
			'relative-oryx-endlessly.ngrok-free.app'
		]
	},
	ssr: {
		external: ["@prisma/client"]
	},
	resolve: {
		alias: {
			".prisma/client/index-browser": "./node_modules/@prisma/client/index-browser.js"
		}
	}
});

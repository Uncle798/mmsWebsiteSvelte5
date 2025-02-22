import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: [
			'relative-oryx-endlessly.ngrok-free.app'
		]
	},
	build:{
		rollupOptions:{
			external: [
				'zod'
			]
		}
	}
});

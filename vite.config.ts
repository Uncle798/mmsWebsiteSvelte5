import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const modulePath = 'node_modules/@skeletonlabs/skeleton/dist/themes';
const files = readdirSync(modulePath);
const fileContents = files.map(file => {
	return {
		name: file.substring(0,file.indexOf('.')),
		content: readFileSync(join(modulePath, file), 'utf-8')
	}
})
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
	// build:{
	// 	rollupOptions:{
	// 		external: [
	// 			'zod'
	// 		]
	// 	}
	// },
	define: {
		THEMES: fileContents
	}
});

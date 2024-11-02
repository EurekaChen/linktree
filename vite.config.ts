import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [sveltekit(),nodePolyfills()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

	define:{
		'process.env':{}
	}
});

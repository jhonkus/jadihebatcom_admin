import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/lib/server/**/__tests__/*.test.ts']
	},
	// Prevent vitest from loading the project's vite.config.ts which pulls in the Svelte plugin
	vite: {
		// tells Vite not to try loading a config file from the project root
		configFile: false as unknown as string
	}
});

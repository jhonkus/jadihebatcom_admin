import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'auto';

// Default theme
const defaultTheme: Theme = 'light';

// Create the theme store
function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(defaultTheme);

	return {
		subscribe,
		set,
		update,
		
		// Initialize theme from localStorage or system preference
		init: () => {
			if (!browser) return;
			
			const stored = localStorage.getItem('theme') as Theme;
			if (stored && ['light', 'dark', 'auto'].includes(stored)) {
				set(stored);
				if (stored === 'auto') {
					const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
					applyTheme(systemPrefersDark ? 'dark' : 'light');
				} else {
					applyTheme(stored as 'light' | 'dark');
				}
			} else {
				// Check system preference
				const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const initialTheme = systemPrefersDark ? 'dark' : 'light';
				set('auto');
				applyTheme(initialTheme);
			}
		},
		
		// Set theme and persist to localStorage
		setTheme: (theme: Theme) => {
			if (!browser) return;
			
			set(theme);
			localStorage.setItem('theme', theme);
			
			if (theme === 'auto') {
				const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				applyTheme(systemPrefersDark ? 'dark' : 'light');
			} else {
				applyTheme(theme);
			}
		},
		
		// Toggle between light and dark (skipping auto for simple toggle)
		toggle: () => {
			update(current => {
				const newTheme = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		}
	};
}

// Apply theme to document
function applyTheme(theme: 'light' | 'dark') {
	if (!browser) return;
	
	const root = document.documentElement;
	root.setAttribute('data-theme', theme);
	
	// Update meta theme-color for mobile browsers
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute('content', theme === 'dark' ? '#1e293b' : '#ffffff');
	}
}

// Listen for system theme changes
if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', (e) => {
		const currentTheme = localStorage.getItem('theme') as Theme;
		if (currentTheme === 'auto' || !currentTheme) {
			applyTheme(e.matches ? 'dark' : 'light');
		}
	});
}

export const theme = createThemeStore();

// Utility function to get current effective theme
export function getEffectiveTheme(): 'light' | 'dark' {
	if (!browser) return 'light';
	
	const stored = localStorage.getItem('theme') as Theme;
	if (stored === 'auto' || !stored) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return stored as 'light' | 'dark';
}

// Utility function to check if current theme is dark
export function isDarkMode(): boolean {
	return getEffectiveTheme() === 'dark';
}
<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { theme, type Theme } from '$lib/stores/theme';

	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let showLabels: boolean = false;
	export let variant: 'button' | 'switch' = 'switch';

	let currentTheme: Theme = 'light';
	let mounted = false;

	// Size configurations
	const sizeConfig = {
		sm: { width: '40px', height: '20px', iconSize: '14px' },
		md: { width: '50px', height: '24px', iconSize: '16px' },
		lg: { width: '60px', height: '30px', iconSize: '20px' }
	};

	onMount(() => {
		mounted = true;
		theme.init();
	});

	// Subscribe to theme changes
	theme.subscribe(value => {
		currentTheme = value;
	});

	function handleToggle() {
		theme.toggle();
	}

	function handleThemeSelect(selectedTheme: Theme) {
		theme.setTheme(selectedTheme);
	}

	$: config = sizeConfig[size];
	$: isDark = currentTheme === 'dark';
	$: isAuto = currentTheme === 'auto';
</script>

{#if variant === 'switch'}
	<!-- Modern Switch Toggle -->
	<div class="theme-toggle-container">
		{#if showLabels}
			<span class="theme-label" class:active={!isDark}>
				<Sun size="16" aria-hidden="true" />
				Light
			</span>
		{/if}
		
		<button
			class="theme-switch"
			class:dark={isDark}
			onclick={handleToggle}
			style="width: {config.width}; height: {config.height};"
			title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<div class="switch-thumb" style="width: {parseInt(config.height) - 4}px; height: {parseInt(config.height) - 4}px;">
				<svelte:component this={isDark ? Moon : Sun} class="thumb-icon" size={parseInt(config.iconSize)} aria-hidden="true" />
			</div>
		</button>
		
		{#if showLabels}
			<span class="theme-label" class:active={isDark}>
				<Moon size="16" aria-hidden="true" />
				Dark
			</span>
		{/if}
	</div>
{:else}
	<!-- Button Variant -->
	<div class="theme-button-group">
		<button
			class="theme-button"
			class:active={currentTheme === 'light'}
			onclick={() => handleThemeSelect('light')}
			title="Light mode"
		>
			<Sun size="20" aria-hidden="true" />
			{#if showLabels}Light{/if}
		</button>
		
		<button
			class="theme-button"
			class:active={currentTheme === 'auto'}
			onclick={() => handleThemeSelect('auto')}
			title="Auto mode (follow system)"
		>
			<Monitor size="20" aria-hidden="true" />
			{#if showLabels}Auto{/if}
		</button>
		
		<button
			class="theme-button"
			class:active={currentTheme === 'dark'}
			onclick={() => handleThemeSelect('dark')}
			title="Dark mode"
		>
			<Moon size="20" aria-hidden="true" />
			{#if showLabels}Dark{/if}
		</button>
	</div>
{/if}

<style>
	/* Switch Toggle Styles */
	.theme-toggle-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.theme-switch {
		position: relative;
		background: #e2e8f0;
		border: 2px solid #cbd5e1;
		border-radius: 100px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		padding: 2px;
		outline: none;
	}

	.theme-switch:hover {
		border-color: #94a3b8;
		transform: scale(1.05);
	}

	.theme-switch:focus-visible {
		box-shadow: 0 0 0 2px #3b82f6;
	}

	.theme-switch.dark {
		background: #1e293b;
		border-color: #475569;
	}

	.theme-switch.dark:hover {
		border-color: #64748b;
	}

	.switch-thumb {
		background: white;
		border-radius: 50%;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 1;
	}

	.theme-switch.dark .switch-thumb {
		background: #1e293b;
		transform: translateX(calc(100% + 4px));
	}

	.thumb-icon {
		color: #64748b;
		transition: all 0.3s ease;
	}

	.theme-switch.dark .thumb-icon {
		color: #f1f5f9;
	}

	.theme-label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		color: #64748b;
		transition: all 0.2s ease;
		user-select: none;
	}

	.theme-label.active {
		color: #1e293b;
		font-weight: 500;
	}

	/* Button Group Styles */
	.theme-button-group {
		display: flex;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid #e2e8f0;
		background: white;
	}

	.theme-button {
		background: transparent;
		border: none;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		color: #64748b;
		border-right: 1px solid #e2e8f0;
	}

	.theme-button:last-child {
		border-right: none;
	}

	.theme-button:hover {
		background: #f8fafc;
		color: #1e293b;
	}

	.theme-button.active {
		background: #3b82f6;
		color: white;
	}

	.theme-button.active:hover {
		background: #2563eb;
	}

	.theme-button svg {
		width: 1rem;
		height: 1rem;
	}

	/* Dark mode styles */
	:global([data-theme="dark"]) .theme-label {
		color: #94a3b8;
	}

	:global([data-theme="dark"]) .theme-label.active {
		color: #f1f5f9;
	}

	:global([data-theme="dark"]) .theme-button-group {
		background: #1e293b;
		border-color: #374151;
	}

	:global([data-theme="dark"]) .theme-button {
		color: #94a3b8;
		border-color: #374151;
	}

	:global([data-theme="dark"]) .theme-button:hover {
		background: #374151;
		color: #f1f5f9;
	}

	/* Animations */
	@keyframes themeSwitch {
		0% { transform: scale(1); }
		50% { transform: scale(1.1); }
		100% { transform: scale(1); }
	}

	.theme-switch:active {
		animation: themeSwitch 0.2s ease;
	}
</style>
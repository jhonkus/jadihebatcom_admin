<script lang="ts">
	import { onMount } from 'svelte';

	export let progress: number = 0; // 0-100
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let variant: 'primary' | 'success' | 'warning' | 'info' = 'primary';
	export let showPercentage: boolean = true;
	export let showLabel: boolean = false;
	export let label: string = '';
	export let animated: boolean = true;
	export let striped: boolean = false;
	export let rounded: boolean = true;

	let animatedProgress = 0;
	let progressBar: HTMLElement;

	// Size configurations
	const sizeConfig = {
		sm: { height: '4px', fontSize: '0.75rem' },
		md: { height: '8px', fontSize: '0.875rem' },
		lg: { height: '12px', fontSize: '1rem' }
	};

	// Color configurations
	const colorConfig = {
		primary: {
			bg: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
			glow: '#3b82f6'
		},
		success: {
			bg: 'linear-gradient(45deg, #10b981, #059669)',
			glow: '#10b981'
		},
		warning: {
			bg: 'linear-gradient(45deg, #f59e0b, #d97706)',
			glow: '#f59e0b'
		},
		info: {
			bg: 'linear-gradient(45deg, #06b6d4, #0891b2)',
			glow: '#06b6d4'
		}
	};

	onMount(() => {
		// Animate progress on mount
		setTimeout(() => {
			animatedProgress = Math.min(Math.max(progress, 0), 100);
		}, 100);
	});

	// Update animated progress when progress prop changes
	$: if (progress !== undefined) {
		animatedProgress = Math.min(Math.max(progress, 0), 100);
	}

	$: currentSize = sizeConfig[size];
	$: currentColor = colorConfig[variant];
</script>

<div class="progress-container" class:show-label={showLabel}>
	{#if showLabel && label}
		<div class="progress-label">
			<span class="label-text">{label}</span>
			{#if showPercentage}
				<span class="percentage">{Math.round(animatedProgress)}%</span>
			{/if}
		</div>
	{/if}
	
	<div 
		class="progress-track" 
		class:rounded
		style="height: {currentSize.height};"
	>
		<div
			bind:this={progressBar}
			class="progress-fill"
			class:animated
			class:striped
			class:rounded
			style="
				width: {animatedProgress}%;
				background: {currentColor.bg};
				box-shadow: {animatedProgress > 0 ? `0 0 10px ${currentColor.glow}40` : 'none'};
			"
		>
			{#if animated}
				<div class="progress-shine"></div>
			{/if}
		</div>
	</div>
	
	{#if showPercentage && !showLabel}
		<div class="percentage-only" style="font-size: {currentSize.fontSize};">
			{Math.round(animatedProgress)}%
		</div>
	{/if}
</div>

<style>
	.progress-container {
		width: 100%;
		position: relative;
	}

	.progress-container.show-label {
		margin-bottom: 0.5rem;
	}

	.progress-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.label-text {
		color: var(--theme-text);
		font-weight: 500;
	}

	.percentage {
		color: var(--theme-text-muted);
		font-weight: 600;
	}

	.progress-track {
		background-color: var(--learning-progress-track, #f3f4f6);
		overflow: hidden;
		position: relative;
		border: 1px solid var(--theme-border);
		transition: all 0.3s ease;
	}

	.progress-track.rounded {
		border-radius: 100px;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.progress-fill.rounded {
		border-radius: 100px;
	}

	.progress-fill.striped {
		background-image: linear-gradient(
			45deg,
			rgba(255, 255, 255, 0.15) 25%,
			transparent 25%,
			transparent 50%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.15) 75%,
			transparent 75%,
			transparent
		);
		background-size: 1rem 1rem;
	}

	.progress-fill.animated.striped {
		animation: progress-bar-stripes 1s linear infinite;
	}

	.progress-shine {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.4),
			transparent
		);
		animation: shine 2s infinite;
	}

	.percentage-only {
		text-align: center;
		margin-top: 0.25rem;
		color: var(--theme-text-muted);
		font-weight: 600;
	}

	@keyframes progress-bar-stripes {
		0% {
			background-position-x: 1rem;
		}
	}

	@keyframes shine {
		0% {
			left: -100%;
		}
		50% {
			left: 100%;
		}
		100% {
			left: 100%;
		}
	}
</style>
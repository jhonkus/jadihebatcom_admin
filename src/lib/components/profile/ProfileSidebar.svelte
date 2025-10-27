<!-- src/lib/components/profile/ProfileSidebar.svelte -->
<script lang="ts">
	import { User, Lock, GraduationCap, Award } from 'lucide-svelte';
	export let activeTab: string = 'profile';

	const iconMap = {
		profile: User,
		password: Lock,
		courses: GraduationCap,
		certificates: Award
	};

	const menuItems = [
		{ id: 'profile', icon: 'profile', label: 'Informasi Pribadi' },
		{ id: 'password', icon: 'password', label: 'Ubah Password' },
		{ id: 'courses', icon: 'courses', label: 'Kursus Saya', href: '/my-courses' },
		{ id: 'certificates', icon: 'certificates', label: 'Sertifikat', disabled: true }
	];
</script>

<div class="profile-sidebar">
	<div class="sidebar-header">
		<h5 class="sidebar-title">
			<User size="24" aria-hidden="true" />
			Akun Saya
		</h5>
	</div>

	<nav class="sidebar-nav">
		{#each menuItems as item}
			{#if item.href}
				<a href={item.href} class="nav-item" class:disabled={item.disabled}>
					<svelte:component this={iconMap[item.icon]} size="20" aria-hidden="true" />
					<span class="nav-label">{item.label}</span>
					{#if item.disabled}
						<span class="badge">Soon</span>
					{/if}
				</a>
			{:else}
				<button
					type="button"
					class="nav-item"
					class:active={activeTab === item.id}
					class:disabled={item.disabled}
					onclick={() => !item.disabled && (activeTab = item.id)}
					disabled={item.disabled}
				>
					<svelte:component this={iconMap[item.icon]} size="20" aria-hidden="true" />
					<span class="nav-label">{item.label}</span>
					{#if item.disabled}
						<span class="badge">Soon</span>
					{/if}
				</button>
			{/if}
		{/each}
	</nav>
</div>

<style>
	.profile-sidebar {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
		overflow: hidden;
	}

	.sidebar-header {
		padding: 1.5rem;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
	}

	.sidebar-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sidebar-nav {
		padding: 0.5rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		width: 100%;
		border: none;
		background: none;
		border-radius: 12px;
		color: #64748b;
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
		margin-bottom: 0.25rem;
		position: relative;
	}

	.nav-item:hover:not(.disabled) {
		background: rgba(102, 126, 234, 0.08);
		color: #3b82f6;
	}

	.nav-item.active {
		background: rgba(102, 126, 234, 0.12);
		color: #3b82f6;
		font-weight: 600;
	}

	.nav-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.nav-item svg {
		flex-shrink: 0;
	}

	.nav-label {
		flex: 1;
		text-align: left;
	}

	.badge {
		font-size: 0.625rem;
		padding: 0.25rem 0.5rem;
		background: #f59e0b;
		color: white;
		border-radius: 6px;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.profile-sidebar {
			margin-bottom: 1rem;
		}

		.nav-item {
			font-size: 0.875rem;
			padding: 0.75rem 0.875rem;
		}
	}
</style>

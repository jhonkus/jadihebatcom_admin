<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	// import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte'; // Commented out - only used in learning interface

	/** @type {{ first_name?: string; last_name?: string } | null} */
	export let user = null;
	export let isAuthenticated = false;

	let clientUser = user;
	let clientAuth = isAuthenticated;

	// Load user data from cookies on client-side
	onMount(() => {
		if (browser) {
			try {
				const cookies = document.cookie.split(';');
				
				// Check for auth token
				const authCookie = cookies.find((c) => c.trim().startsWith('jadihebat_auth='));
				clientAuth = !!authCookie;
				
				// Load user data if authenticated
				if (clientAuth) {
					const userCookie = cookies.find((c) => c.trim().startsWith('jadihebat_user='));
					if (userCookie) {
						const userData = decodeURIComponent(userCookie.split('=')[1]);
						clientUser = JSON.parse(userData);
					}
				}
			} catch (e) {
				console.error('Failed to load user from cookie:', e);
			}
		}
	});

	// Sync with props if they change (for pages that do pass user data)
	$: if (user && !clientUser) {
		clientUser = user;
	}
	$: if (isAuthenticated && !clientAuth) {
		clientAuth = isAuthenticated;
	}

	let showUserMenu = false;
	let showLogoutConfirm = false;
	let logoutLoading = false;

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function closeUserMenu() {
		showUserMenu = false;
	}

	// Close menu when clicking outside
	function handleClickOutside(event) {
		const target = event.target;
		// Guard: some targets (e.g., text nodes/SVG) may not be Elements
		if (!(target instanceof Element)) return;
		if (!target.closest('.user-menu-wrapper')) {
			closeUserMenu();
		}
	}

	// Get user initials
	function getUserInitials(user) {
		if (!user) return '?';

		const firstInitial = user.first_name?.charAt(0) || '';
		const lastInitial = user.last_name?.charAt(0) || '';

		if (firstInitial || lastInitial) {
			return (firstInitial + lastInitial).toUpperCase();
		}

		return '?';
	}

	function getUserDisplayName(user) {
		if (!user) return 'User';

		if (user.first_name || user.last_name) {
			return `${user.first_name || ''} ${user.last_name || ''}`.trim();
		}

		return 'User';
	}

	// ✅ TAMPILKAN CONFIRMASI LOGOUT
	function confirmLogout() {
		showLogoutConfirm = true;
		closeUserMenu();
	}

	// ✅ BATAL LOGOUT
	function cancelLogout() {
		showLogoutConfirm = false;
	}

	// ✅ PROSES LOGOUT - PERBAIKI
	async function handleLogout() {
		if (!browser) return;

		logoutLoading = true;

		try {
			const response = await fetch('/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Clear semua data client-side
				localStorage.removeItem('user_data');
				clearAuthCookies();

				// Redirect ke login
				window.location.href = '/login?message=logged_out';
			} else {
				// console.error('Logout failed with status:', response.status);
				// Fallback manual
				clearAuthCookies();
				window.location.href = '/login';
			}
		} catch {
			// console.error('Logout error:', error);
			// Fallback manual
			clearAuthCookies();
			window.location.href = '/login';
		}
	}

	function clearAuthCookies() {
		// Do not attempt to delete httpOnly cookies from client-side.
		// Server will clear auth cookies via /logout endpoint; here we only clear local client storage.
		localStorage.removeItem('user_data');
	}
</script>

<svelte:window on:click={handleClickOutside} />

<!-- NAVBAR CODE ANDA TETAP SAMA -->
<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
	<div class="container">
		<!-- Brand -->
		<a class="navbar-brand fw-bold" href="/">
			<span class="text-primary">Jadi</span>Hebat.com
		</a>

		<!-- Mobile Toggle -->
		<button
			class="navbar-toggler"
			type="button"
			aria-label="Toggle navigation"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<!-- Navigation -->
		<div class="collapse navbar-collapse" id="navbarNav">
			<!-- Left Menu -->
			<ul class="navbar-nav mx-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link" class:active={$page.url.pathname === '/'} href="/"> Beranda </a>
				</li>
				<li class="nav-item">
					<a
						class="nav-link"
						class:active={$page.url.pathname.startsWith('/courses')}
						href="/courses"
					>
						Kursus
					</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" class:active={$page.url.pathname.startsWith('/blog')} href="/blog">
						Blog
					</a>
				</li>
				{#if clientAuth}
					<li class="nav-item">
						<a
							class="nav-link"
							class:active={$page.url.pathname.startsWith('/my-courses')}
							href="/my-courses"
						>
							Pembelajaran Saya
						</a>
					</li>
				{/if}
			</ul>

			<!-- Right Menu -->
			<ul class="navbar-nav ms-auto align-items-lg-center">
				<!-- Theme Toggle - Commented out for now, only enabled in learning interface -->
				<!-- <li class="nav-item me-3">
					<ThemeToggle size="md" variant="switch" />
				</li> -->

				{#if clientAuth && clientUser}
					<!-- User Menu -->
					<li class="nav-item user-menu-wrapper position-relative">
						<button
							type="button"
							class="btn btn-link nav-link d-flex align-items-center gap-2 text-decoration-none"
							onclick={(e) => {
								e.stopPropagation();
								toggleUserMenu();
							}}
							aria-expanded={showUserMenu}
						>
							<!-- Avatar -->
							<div class="user-avatar">
								{getUserInitials(clientUser)}
							</div>

							<!-- Name (hidden on mobile) -->
							<span class="d-none d-lg-inline fw-medium">
								{getUserDisplayName(clientUser)}
							</span>

							<!-- Dropdown Icon -->
							<svg
								width="16"
								height="16"
								fill="currentColor"
								class="dropdown-icon"
								class:rotate={showUserMenu}
							>
								<path d="M4.5 6l3.5 3.5L11.5 6z" />
							</svg>
						</button>

						<!-- Dropdown Menu -->
						{#if showUserMenu}
							<div class="user-dropdown shadow-lg">
								<!-- User Info -->
								<div class="user-info">
									<div class="user-avatar-large">
										{getUserInitials(clientUser)}
									</div>
									<div class="user-details">
										<div class="user-name fw-semibold">
											{getUserDisplayName(clientUser)}
										</div>
									</div>
								</div>

								<hr class="my-2" />

								<!-- Menu Items -->
								<a href="/profile" class="dropdown-item" onclick={closeUserMenu}>
									<span class="me-2">👤</span>
									Profil Saya
								</a>
								<a href="/my-courses" class="dropdown-item" onclick={closeUserMenu}>
									<span class="me-2">📚</span>
									Pembelajaran Saya
								</a>

								<hr class="my-2" />

								<!-- LOGOUT BUTTON -->
								<button type="button" class="dropdown-item text-danger" onclick={confirmLogout}>
									<span class="me-2">🚪</span>
									Keluar
								</button>
							</div>
						{/if}
					</li>
				{:else}
					<!-- Guest Menu -->
					<li class="nav-item">
						<a class="nav-link" href="/login">Login</a>
					</li>
					<li class="nav-item">
						<a class="btn btn-primary btn-sm ms-lg-2" href="/register"> Daftar Gratis </a>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</nav>

<!-- ✅ PERBAIKI CONFIRMATION DIALOG -->
{#if showLogoutConfirm}
	<div class="modal-backdrop show"></div>
	<div class="modal show d-block" tabindex="-1">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Konfirmasi Logout</h5>
				</div>
				<div class="modal-body">
					<p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" onclick={cancelLogout}> Batal </button>
					<button type="button" class="btn btn-danger" onclick={handleLogout}>
						{#if logoutLoading}
							<span class="spinner-border spinner-border-sm me-2"></span>
							Memproses...
						{:else}
							Ya, Keluar
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- STYLE ANDA TETAP SAMA -->
<style>
	.navbar {
		padding: 1rem 0;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 1030;
		pointer-events: auto;
		isolation: isolate;
		background-color: white;
	}

	.navbar-brand {
		font-size: 1.5rem;
	}

	.nav-link {
		font-weight: 500;
		padding: 0.5rem 1rem;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: var(--bs-primary) !important;
	}

	.nav-link.active {
		color: var(--bs-primary) !important;
	}

	.user-menu-wrapper .btn {
		position: relative;
		z-index: 1030;
		cursor: pointer;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--bs-primary), var(--color-primary-700, #2563eb));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.user-avatar-large {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--bs-primary), var(--color-primary-700, #2563eb));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1.125rem;
	}

	.dropdown-icon {
		transition: transform 0.2s;
	}

	.dropdown-icon.rotate {
		transform: rotate(180deg);
	}

	.user-menu-wrapper {
		position: relative;
		z-index: 1030;
	}

	.user-menu-wrapper-desktop {
		position: relative;
		z-index: 1040;
	}

	.user-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		min-width: 280px;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 1040;
		animation: slideDown 0.2s ease-out;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.user-info {
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-details {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		padding: 0.625rem 1rem;
		color: #333;
		text-decoration: none;
		font-size: 0.9375rem;
		transition: background-color 0.15s;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
	}

	.dropdown-item:hover {
		background-color: #f8f9fa;
	}

	.dropdown-item.text-danger:hover {
		background-color: #fff5f5;
	}

	.modal-backdrop {
		opacity: 0.5;
		z-index: 1050;
	}

	.modal {
		z-index: 1055;
	}

	@media (max-width: 991.98px) {
		.user-dropdown {
			position: fixed;
			top: auto;
			right: 1rem;
			left: 1rem;
			width: auto;
			max-width: 360px;
			margin: 0 auto;
		}

		.nav-item {
			margin: 0.25rem 0;
		}
	}
</style>

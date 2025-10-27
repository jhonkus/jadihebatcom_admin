<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { getImageUrl } from '$lib/utils/images';
	import { Edit, CheckCircle, Save, AlertCircle, User, Lock, GraduationCap, LogOut, AlertTriangle, RefreshCw } from 'lucide-svelte';

	interface ProfileUser {
		id: string;
		email: string;
		first_name: string;
		last_name: string;
		avatar?: string;
	}

	let { data, form } = $props<{
		data: { user: ProfileUser; error?: string };
		form: any;
	}>();

	let user = $derived(data.user as ProfileUser);

	let activeTab = $state('profile');
	let loadingProfile = $state(false);
	let loadingPassword = $state(false);
	let loadingAvatar = $state(false);

	let avatarFile = $state<File | null>(null);
	let avatarPreview = $state<string | null>(null);

	function handleAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];

			// Validate file type (validation already done server-side, but check here too)
			const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				alert('Tipe file tidak didukung. Harap unggah gambar dalam format PNG, JPEG, atau WEBP.');
				return;
			}

			// Validate file size (e.g., max 2MB)
			const maxSize = 2 * 1024 * 1024; // 2MB
			if (file.size > maxSize) {
				alert('Ukuran file melebihi 2MB. Harap unggah gambar yang lebih kecil.');
				return;
			}

			// Revoke previous preview URL if it exists
			if (avatarPreview) {
				URL.revokeObjectURL(avatarPreview);
			}

			avatarFile = file;
			avatarPreview = URL.createObjectURL(file);
		}
	}

	function cancelAvatarChange() {
		avatarFile = null;
		avatarPreview = null;
		const input = document.getElementById('avatar-input') as HTMLInputElement;
		if (input) input.value = '';
	}

	function getUserInitials() {
		if (!user) return '?';
		const firstInitial = user.first_name?.charAt(0) || '';
		const lastInitial = user.last_name?.charAt(0) || '';
		return (firstInitial + lastInitial).toUpperCase() || user.email?.charAt(0).toUpperCase();
	}

	function getUserDisplayName() {
		if (!user) return 'User';
		if (user.first_name || user.last_name) {
			return `${user.first_name || ''} ${user.last_name || ''}`.trim();
		}
		return user.email;
	}
</script>

<svelte:head>
	<title>Profil Saya - jadihebat</title>
</svelte:head>

<div class="profile-page-new">
	<div class="container">
		<div class="row g-4">
			<!-- Left Sidebar -->
			<div class="col-lg-4">
				<div class="profile-sidebar">
					<form
						class="avatar-form"
						method="POST"
						action="?/updateAvatar"
						enctype="multipart/form-data"
						use:enhance={() => {
							loadingAvatar = true;
							return async ({ result, update }) => {
								await update({ reset: false });
								loadingAvatar = false;

								if (result.type === 'success' && result.data?.updatedUser) {
									data.user = result.data.updatedUser as ProfileUser;
									cancelAvatarChange();
								}
							};
						}}
					>
						<div class="profile-card-header">
							<div class="avatar-wrapper">
								<label for="avatar-input" class="avatar-change-btn">
									<Edit size="16" aria-hidden="true" />
								</label>
								{#if avatarPreview}
									<img src={avatarPreview} alt="Avatar Preview" class="user-avatar-img" />
								{:else if user?.avatar}
									<img src={getImageUrl(user.avatar)} alt="User Avatar" class="user-avatar-img" />
								{:else}
									<div class="user-avatar-initials">{getUserInitials()}</div>
								{/if}
							</div>

							<input
								id="avatar-input"
								type="file"
								name="avatar"
								onchange={handleAvatarChange}
								accept="image/png, image/jpeg, image/webp"
								hidden
							/>

							{#if avatarFile}
								<div>
									{#if form?.successAvatar}
										<div class="alert alert-success alert-sm">
											<CheckCircle size="16" aria-hidden="true" />
											<span>{form.messageAvatar || 'Avatar berhasil diperbarui!'}</span>
										</div>
									{/if}
									<p class="avatar-filename">{avatarFile.name}</p>
									<div class="avatar-actions">
										<button type="submit" class="btn btn-sm btn-primary" disabled={loadingAvatar}>
											{#if loadingAvatar}
												<span class="spinner-border spinner-border-sm"></span>
											{:else}
												<Save size="16" aria-hidden="true" />
											{/if}
											Simpan
										</button>
										<button
											type="button"
											class="btn btn-sm btn-secondary"
											onclick={() => cancelAvatarChange()}
											disabled={loadingAvatar}>Batal</button
										>
									</div>
									{#if form?.errorAvatar}
										<div class="alert alert-danger alert-sm">
											<AlertCircle size="16" aria-hidden="true" />
											<span>{form.errorAvatar}</span>
										</div>
									{/if}
								</div>
							{:else}
								<div>
									<h2 class="user-name">{getUserDisplayName()}</h2>
									<p class="user-email">{user?.email}</p>
								</div>
							{/if}
						</div>
					</form>
					<div class="profile-nav">
						<button
							class="nav-item"
							class:active={activeTab === 'profile'}
							onclick={() => (activeTab = 'profile')}
						>
							<User size="16" aria-hidden="true" />
							<span>Profil</span>
						</button>
						<button
							class="nav-item"
							class:active={activeTab === 'password'}
							onclick={() => (activeTab = 'password')}
						>
							<Lock size="16" aria-hidden="true" />
							<span>Keamanan</span>
						</button>
						<a href="/my-courses" class="nav-item">
							<GraduationCap size="16" aria-hidden="true" />
							<span>Kursus Saya</span>
						</a>
						<a href="/logout" class="nav-item nav-item-logout">
							<LogOut size="16" aria-hidden="true" />
							<span>Keluar</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Right Content -->
			<div class="col-lg-8">
				<div class="profile-content">
					{#if activeTab === 'profile'}
						<!-- Edit Profile Form -->
						<div class="content-card">
							<div class="card-header">
								<h3 class="card-title">Edit Profil</h3>
								<p class="card-subtitle">Perbarui informasi akun Anda di sini.</p>
							</div>
							<div class="card-body">
								{#if form?.success}
									<div class="alert alert-success">
										<CheckCircle size="16" aria-hidden="true" />
										<span>{form.message}</span>
									</div>
								{/if}

								{#if form?.error && !form?.errorPassword}
									<div class="alert alert-danger">
										<AlertCircle size="16" aria-hidden="true" />
										<span>{form.error}</span>
									</div>
								{/if}

								{#if data.error}
									<div class="alert alert-warning">
										<AlertTriangle size="16" aria-hidden="true" />
										<span>{data.error}</span>
									</div>
								{/if}

								<form
									method="POST"
									action="?/updateProfile"
									use:enhance={() => {
										loadingProfile = true;
										return async ({ update }) => {
											await update();
											loadingProfile = false;
										};
									}}
								>
									<div class="row g-3">
										<div class="col-md-6">
											<label for="first_name" class="form-label">Nama Depan</label>
											<input
												id="first_name"
												type="text"
												class="form-control"
												name="first_name"
												required
												disabled={loadingProfile}
												placeholder="Cth: John"
												value={user?.first_name ?? ''}
											/>
										</div>
										<div class="col-md-6">
											<label for="last_name" class="form-label">Nama Belakang</label>
											<input
												id="last_name"
												type="text"
												class="form-control"
												name="last_name"
												disabled={loadingProfile}
												placeholder="Cth: Doe"
												value={user?.last_name ?? ''}
											/>
										</div>
										<div class="col-12">
											<label for="email" class="form-label">Alamat Email</label>
											<input
												id="email"
												type="email"
												class="form-control"
												value={user?.email}
												disabled
											/>
											<div class="form-text">Email tidak dapat diubah.</div>
										</div>
									</div>
									<div class="card-footer">
										<button type="submit" class="btn btn-primary" disabled={loadingProfile}>
										{#if loadingProfile}
											<span class="spinner-border spinner-border-sm me-2"></span>
											Menyimpan...
										{:else}
											<Save size="18" aria-hidden="true" />
											Simpan Perubahan
										{/if}
									</button>
									</div>
								</form>
							</div>
						</div>
					{:else if activeTab === 'password'}
						<!-- Change Password Form -->
						<div class="content-card">
							<div class="card-header">
								<h3 class="card-title">Ubah Password</h3>
								<p class="card-subtitle">Untuk keamanan, gunakan password yang kuat dan unik.</p>
							</div>
							<div class="card-body">
						{#if form?.successPassword}
								<div class="alert alert-success">
									<CheckCircle size="20" aria-hidden="true" />
									<span>{form.messagePassword}</span>
								</div>
							{/if}

							{#if form?.errorPassword}
								<div class="alert alert-danger">
									<AlertCircle size="20" aria-hidden="true" />
									<span>{form.errorPassword}</span>
								</div>
							{/if}								<form
									method="POST"
									action="?/updatePassword"
									use:enhance={() => {
										loadingPassword = true;
										return async ({ update }) => {
											await update();
											loadingPassword = false;
										};
									}}
								>
									<div class="row g-3">
										<div class="col-12">
											<label for="current_password" class="form-label">Password Saat Ini</label>
											<input
												id="current_password"
												type="password"
												class="form-control"
												name="current_password"
												required
												disabled={loadingPassword}
												placeholder="Masukkan password Anda saat ini"
												autocomplete="current-password"
											/>
										</div>
										<div class="col-12">
											<label for="new_password" class="form-label">Password Baru</label>
											<input
												id="new_password"
												type="password"
												class="form-control"
												name="new_password"
												required
												disabled={loadingPassword}
												placeholder="Minimal 8 karakter"
												autocomplete="new-password"
												minlength="8"
											/>
											<div class="form-text">Gunakan minimal 8 karakter.</div>
										</div>
										<div class="col-12">
											<label for="confirm_password" class="form-label"
												>Konfirmasi Password Baru</label
											>
											<input
												id="confirm_password"
												type="password"
												class="form-control"
												name="confirm_password"
												required
												disabled={loadingPassword}
												placeholder="Ketik ulang password baru Anda"
												autocomplete="new-password"
												minlength="8"
											/>
										</div>
									</div>
									<div class="card-footer">
										<button type="submit" class="btn btn-primary" disabled={loadingPassword}>
											{#if loadingPassword}
												<span class="spinner-border spinner-border-sm me-2"></span>
											Memperbarui...
										{:else}
											<Lock size="18" aria-hidden="true" />
											Ubah Password
										{/if}
									</button>
									</div>
								</form>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.profile-page-new {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding: 3rem 0;
	}

	/* --- Sidebar --- */
	.profile-sidebar {
		background-color: #ffffff;
		border-radius: 0.75rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		height: 100%;
	}

	.profile-card-header {
		text-align: center;
		padding: 2rem 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.avatar-wrapper {
		position: relative;
		width: 80px;
		height: 80px;
		margin: 0 auto 1rem;
	}

	.user-avatar-initials,
	.user-avatar-img {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.user-avatar-initials {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: white;
	}

	.user-avatar-img {
		object-fit: cover;
	}

	.avatar-change-btn {
		position: absolute;
		bottom: 0;
		right: -5px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: white;
		color: #0d6efd;
		border: 1px solid #dee2e6;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		margin: 0;
		padding: 0;
	}

	.avatar-change-btn:hover {
		transform: scale(1.1);
		background-color: #e7f1ff;
	}

	.avatar-change-btn svg {
		width: 18px;
		height: 18px;
	}

	.avatar-form {
		margin-top: 1rem;
	}

	.avatar-filename {
		font-size: 0.8rem;
		color: #6c757d;
		margin-bottom: 0.75rem;
		word-break: break-all;
	}

	.avatar-actions {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.avatar-actions .btn-sm {
		padding: 0.25rem 0.75rem;
		font-size: 0.8rem;
	}

	.avatar-actions svg {
		width: 1rem;
		height: 1rem;
		margin-right: 0.25rem;
	}

	.user-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: #212529;
		margin-bottom: 0.25rem;
	}

	.user-email {
		font-size: 0.9rem;
		color: #6c757d;
		word-break: break-all;
	}

	.profile-nav {
		padding: 1rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.85rem 1rem;
		border-radius: 0.5rem;
		border: none;
		background-color: transparent;
		text-align: left;
		font-size: 1rem;
		font-weight: 500;
		color: #495057;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.nav-item:hover {
		background-color: #f1f3f5;
		color: #0d6efd;
	}

	.nav-item.active {
		background-color: #e7f1ff;
		color: #0d6efd;
		font-weight: 600;
	}

	.nav-item svg {
		margin-right: 1rem;
		width: 1.3rem;
		height: 1.3rem;
	}

	.nav-item-logout {
		margin-top: 1rem;
		color: #dc3545;
	}
	.nav-item-logout:hover {
		background-color: #fdf2f2;
		color: #dc3545;
	}

	/* --- Content --- */
	.profile-content {
		height: 100%;
	}

	.content-card {
		background-color: #ffffff;
		border-radius: 0.75rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.card-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.card-subtitle {
		color: #6c757d;
		margin-bottom: 0;
	}

	.card-body {
		padding: 1.5rem;
		flex-grow: 1;
	}

	.form-label {
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.form-control {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
	}
	.form-control:disabled {
		background-color: #f1f3f5;
	}

	.form-text {
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}

	.card-footer {
		padding: 1.5rem;
		background-color: #f8f9fa;
		border-top: 1px solid #e9ecef;
		text-align: right;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
	}

	.btn svg {
		margin-right: 0.5rem;
		width: 1.2rem;
		height: 1.2rem;
	}

	.alert {
		display: flex;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.alert svg {
		margin-right: 0.75rem;
	}

	.alert-sm {
		font-size: 0.8rem;
		margin-bottom: 0.75rem;
		padding: 0.5rem 0.75rem;
	}

	@media (max-width: 991.98px) {
		.profile-page-new {
			padding: 1.5rem 0;
		}
	}
</style>

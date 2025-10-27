<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { ActionData } from './$types';
	import { fetchCurrentUser } from '$lib/utils/auth';

	let { form } = $props<{ form: ActionData }>();

	// ✅ FIX: Use $state for reactive variables
	let loading = $state(false);
	let showPassword = $state(false);

	onMount(async () => {
		if (!browser) return;
		const u = await fetchCurrentUser();
		if (u) goto('/');
	});

	$effect(() => {
		if (form?.success) {
			setTimeout(() => {
				goto('/login?message=registered');
			}, 2000);
		}
	});
</script>

<svelte:head>
	<title>Daftar | jadihebat.com</title>
</svelte:head>

<div class="auth-page">
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-md-6 col-lg-5">
				<div class="card border-0 shadow-sm">
					<div class="card-body p-4 p-lg-5">
						<!-- Header -->
						<div class="text-center mb-4">
							<h1 class="h3 fw-bold mb-2">👋 New Account</h1>
							<p class="text-secondary small mb-0">
								Lengkapi form di bawah dengan data Anda yang valid
							</p>
						</div>

						<!-- Success -->
						{#if form?.success}
							<div class="alert alert-success">
								<strong>✓ Registrasi Berhasil!</strong>
								<div class="small">Mengarahkan ke halaman login...</div>
							</div>
						{/if}

						<!-- Error -->
						{#if form?.error}
							<div class="alert alert-danger">
								<strong>⚠ Registrasi Gagal</strong>
								<div class="small">{form.error}</div>
							</div>
						{/if}

						<!-- Form - SAMA PERSIS seperti login -->
						<form
							method="POST"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									try {
										await update();
									} catch {
										// Handle error jika perlu
									} finally {
										loading = false;
									}
								};
							}}
						>
							<!-- Nama Lengkap -->
							<div class="mb-3">
								<label for="full_name" class="form-label">Nama Lengkap</label>
								<input
									id="full_name"
									type="text"
									class="form-control"
									name="full_name"
									required
									disabled={loading}
									placeholder="Masukkan nama lengkap"
									autocomplete="name"
									value={form?.full_name || ''}
									minlength="2"
								/>
								<input type="hidden" name="last_name" value="---" />
							</div>

							<!-- Email -->
							<div class="mb-3">
								<label for="email" class="form-label">Email</label>
								<input
									id="email"
									type="email"
									class="form-control"
									name="email"
									required
									disabled={loading}
									placeholder="nama@email.com"
									autocomplete="email"
									value={form?.email || ''}
								/>
							</div>

							<!-- Password -->
							<div class="mb-4">
								<label for="password" class="form-label">Password</label>
								<div class="position-relative">
									<input
										id="password"
										type={showPassword ? 'text' : 'password'}
										class="form-control"
										name="password"
										required
										disabled={loading}
										placeholder="Minimal 8 karakter"
										autocomplete="new-password"
										minlength="8"
									/>
									<button
										type="button"
										class="btn btn-sm position-absolute top-50 end-0 translate-middle-y"
										style="background: none; border: none; padding-right: 0.75rem;"
										onclick={() => (showPassword = !showPassword)}
										disabled={loading}
										aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
									>
										{showPassword ? '👁️' : '👁️‍🗨️'}
									</button>
								</div>
								<div class="form-text small">Password harus minimal 8 karakter</div>
							</div>

							<!-- Submit -->
							<button type="submit" class="btn btn-primary w-100 mb-3" disabled={loading}>
								{#if loading}
									<span class="spinner-border spinner-border-sm me-2"></span>
									Memproses...
								{:else}
									Daftar
								{/if}
							</button>

							<!-- Login Link -->
							<div class="text-center">
								<small class="text-secondary">
									Sudah punya akun?
									<a href="/login" class="fw-semibold">Login sekarang</a>
								</small>
							</div>
						</form>

						<!-- Terms -->
						<!-- <div class="text-center mt-4 pt-3 border-top">
              <small class="text-secondary">
                Dengan mendaftar, Anda menyetujui 
                <a href="/terms" class="text-decoration-none">Syarat & Ketentuan</a> 
                dan 
                <a href="/privacy" class="text-decoration-none">Kebijakan Privasi</a>
              </small>
            </div> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding: 2rem 0;
		background: linear-gradient(135deg, var(--bs-primary), var(--color-primary-900));
	}

	.form-text {
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}
</style>

<script>
	// @ts-nocheck

	import { enhance } from '$app/forms';

	export let form;

	let loading = false;
	let showPassword = false;
</script>

<svelte:head>
	<title>Login | jadihebat.com</title>
</svelte:head>

<div class="auth-page">
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-md-6 col-lg-5">
				<div class="card border-0 shadow-sm">
					<div class="card-body p-4 p-lg-5">
						<!-- Header -->
						<div class="text-center mb-4">
							<div class="auth-icon mb-3">🔒</div>
							<h1 class="h3 fw-bold mb-2">Selamat Datang</h1>
							<p class="text-secondary small mb-0">Login untuk melanjutkan pembelajaran</p>
						</div>

						<!-- Success -->
						{#if form?.success}
							<div class="alert alert-success">
								<strong>✓ Login Berhasil!</strong>
								<div class="small">Mengarahkan...</div>
							</div>
						{/if}

						<!-- Error -->
						{#if form?.error}
							<div class="alert alert-danger">
								<strong>⚠ Login Gagal</strong>
								<div class="small">{form.error}</div>
							</div>
						{/if}

						<!-- Form -->
						<form
							method="POST"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									await update();
									loading = false;
								};
							}}
						>
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
							<div class="mb-3">
								<div class="d-flex justify-content-between mb-2">
									<label for="password" class="form-label mb-0">Password</label>
									<!-- Removed broken link to /forgot-password -->
								</div>
								<div class="position-relative">
									<input
										id="password"
										type={showPassword ? 'text' : 'password'}
										class="form-control"
										name="password"
										required
										disabled={loading}
										placeholder="Masukkan password"
										autocomplete="current-password"
									/>
									<button
										type="button"
										class="btn btn-sm position-absolute top-50 end-0 translate-middle-y"
										style="background: none; border: none; padding-right: 0.75rem;"
										onclick={() => (showPassword = !showPassword)}
										aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
									>
										{showPassword ? '👁️' : '👁️‍🗨️'}
									</button>
								</div>
							</div>

							<!-- Remember -->
							<!-- <div class="mb-4">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="remember"
                    name="remember"
                    disabled={loading}
                  />
                  <label class="form-check-label small" for="remember">
                    Ingat saya
                  </label>
                </div>
              </div> -->

							<!-- Submit -->
							<button type="submit" class="btn btn-primary w-100 mb-3" disabled={loading}>
								{#if loading}
									<span class="spinner-border spinner-border-sm me-2"></span>
									Memproses...
								{:else}
									Login
								{/if}
							</button>

							<!-- Register Link -->
							<div class="text-center">
								<small class="text-secondary">
									Belum punya akun?
									<!-- Removed broken link to /register -->
								</small>
							</div>
						</form>
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

	.auth-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto;
		background: var(--color-primary-100);
		border-radius: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}
</style>

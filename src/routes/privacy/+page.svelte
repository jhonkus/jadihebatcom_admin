<script>
	import { onMount } from 'svelte';

	onMount(() => {
		// Scroll to top when component mounts
		window.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<title>Kebijakan Privasi - Platform Kursus Online</title>
	<meta
		name="description"
		content="Kebijakan privasi untuk platform kursus online kami. Pelajari bagaimana kami melindungi data dan informasi pribadi Anda."
	/>
</svelte:head>

<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-lg-10">
			<!-- Header -->
			<div class="text-center mb-5">
				<h1 class="display-5 fw-bold mb-3">Kebijakan Privasi</h1>
				<p class="lead text-muted">
					Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
			</div>

			<!-- Introduction -->
			<div class="card border-0 bg-light-accent mb-5">
				<div class="card-body p-4">
					<h2 class="h4 mb-3">👋 Selamat Datang</h2>
					<p class="mb-0">
						Kami berkomitmen untuk melindungi privasi dan data pribadi Anda. Kebijakan privasi ini
						menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi yang Anda
						berikan saat menggunakan platform kursus online kami.
					</p>
				</div>
			</div>

			<!-- Information Collection -->
			<section class="mb-5">
				<h2 class="h3 mb-4">📋 Informasi yang Kami Kumpulkan</h2>

				<div class="row">
					<div class="col-md-6 mb-4">
						<div class="card h-100 border-0">
							<div class="card-body">
								<h5 class="card-title text-primary">Informasi Pribadi</h5>
								<ul class="list-unstyled">
									<li class="mb-2">• Nama lengkap</li>
									<li class="mb-2">• Alamat email</li>
									<li class="mb-2">• Data profil</li>
									<li class="mb-2">• Informasi pembayaran</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="col-md-6 mb-4">
						<div class="card h-100 border-0">
							<div class="card-body">
								<h5 class="card-title text-primary">Data Pembelajaran</h5>
								<ul class="list-unstyled">
									<li class="mb-2">• Progress kursus</li>
									<li class="mb-2">• Hasil kuis dan ujian</li>
									<li class="mb-2">• Aktivitas belajar</li>
									<li class="mb-2">• Interaksi dengan instruktur</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- How We Use Information -->
			<section class="mb-5">
				<h2 class="h3 mb-4">🎯 Cara Kami Menggunakan Informasi</h2>

				<div class="card border-0">
					<div class="card-body">
						<div class="row">
							<div class="col-md-6">
								<div class="d-flex mb-3">
									<span class="badge badge-primary me-3">1</span>
									<div>
										<h5 class="h6 mb-1">Menyediakan Layanan</h5>
										<p class="small text-muted mb-0">
											Memberikan akses ke kursus dan materi pembelajaran
										</p>
									</div>
								</div>

								<div class="d-flex mb-3">
									<span class="badge badge-primary me-3">2</span>
									<div>
										<h5 class="h6 mb-1">Personalisasi Pengalaman</h5>
										<p class="small text-muted mb-0">Menyesuaikan rekomendasi kursus dan konten</p>
									</div>
								</div>

								<div class="d-flex mb-3">
									<span class="badge badge-primary me-3">3</span>
									<div>
										<h5 class="h6 mb-1">Komunikasi</h5>
										<p class="small text-muted mb-0">
											Mengirim update kursus dan notifikasi penting
										</p>
									</div>
								</div>
							</div>

							<div class="col-md-6">
								<div class="d-flex mb-3">
									<span class="badge badge-primary me-3">4</span>
									<div>
										<h5 class="h6 mb-1">Analisis & Pengembangan</h5>
										<p class="small text-muted mb-0">Meningkatkan kualitas platform dan kursus</p>
									</div>
								</div>

								<div class="d-flex mb-3">
									<span class="badge badge-primary me-3">5</span>
									<div>
										<h5 class="h6 mb-1">Dukungan Pelanggan</h5>
										<p class="small text-muted mb-0">Memberikan bantuan dan solusi untuk masalah</p>
									</div>
								</div>

								<div class="d-flex">
									<span class="badge badge-primary me-3">6</span>
									<div>
										<h5 class="h6 mb-1">Keamanan</h5>
										<p class="small text-muted mb-0">
											Melindungi akun dan data dari akses tidak sah
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Data Sharing -->
			<section class="mb-5">
				<h2 class="h3 mb-4">🤝 Berbagi Informasi</h2>

				<div class="alert alert-primary">
					<p class="mb-0">
						<strong>Kami tidak menjual data pribadi Anda.</strong> Informasi hanya dibagikan dengan pihak
						ketiga dalam kondisi tertentu:
					</p>
				</div>

				<div class="row mt-4">
					<div class="col-md-4 mb-3">
						<div class="text-center">
							<div
								class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
								style="width: 60px; height: 60px;"
							>
								<i>🔒</i>
							</div>
							<h5 class="h6">Penyedia Layanan</h5>
							<p class="small text-muted">Partner teknis yang membantu operasional platform</p>
						</div>
					</div>

					<div class="col-md-4 mb-3">
						<div class="text-center">
							<div
								class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
								style="width: 60px; height: 60px;"
							>
								<i>⚖️</i>
							</div>
							<h5 class="h6">Kepatuhan Hukum</h5>
							<p class="small text-muted">Saat diperlukan oleh hukum atau regulasi yang berlaku</p>
						</div>
					</div>

					<div class="col-md-4 mb-3">
						<div class="text-center">
							<div
								class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
								style="width: 60px; height: 60px;"
							>
								<i>🛡️</i>
							</div>
							<h5 class="h6">Perlindungan</h5>
							<p class="small text-muted">
								Untuk melindungi hak, properti, atau keamanan kami dan pengguna lain
							</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Data Protection -->
			<section class="mb-5">
				<h2 class="h3 mb-4">🔒 Perlindungan Data</h2>

				<div class="card border-0 bg-light">
					<div class="card-body">
						<div class="row">
							<div class="col-md-6">
								<h5 class="mb-3">Teknologi Keamanan</h5>
								<ul class="list-unstyled">
									<li class="mb-2">• Enkripsi data selama transmisi</li>
									<li class="mb-2">• Penyimpanan data yang aman</li>
									<li class="mb-2">• Akses terbatas untuk personel berwenang</li>
								</ul>
							</div>
							<div class="col-md-6">
								<h5 class="mb-3">Hak Anda</h5>
								<ul class="list-unstyled">
									<li class="mb-2">• Akses ke data pribadi</li>
									<li class="mb-2">• Permintaan koreksi data</li>
									<li class="mb-2">• Penghapusan akun dan data</li>
									<li class="mb-2">• Penarikan persetujuan</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Cookies -->
			<section class="mb-5">
				<h2 class="h3 mb-4">🍪 Penggunaan Cookies</h2>

				<p>Kami menggunakan cookies dan teknologi serupa untuk:</p>

				<div class="row g-3">
					<div class="col-sm-6 col-lg-3">
						<div class="card text-center h-100 border-0">
							<div class="card-body">
								<div class="text-primary mb-2">🔄</div>
								<h6 class="card-title">Fungsi Esensial</h6>
								<p class="small text-muted">Memastikan platform berfungsi dengan baik</p>
							</div>
						</div>
					</div>

					<div class="col-sm-6 col-lg-3">
						<div class="card text-center h-100 border-0">
							<div class="card-body">
								<div class="text-primary mb-2">📊</div>
								<h6 class="card-title">Analitik</h6>
								<p class="small text-muted">Memahami bagaimana Anda menggunakan platform</p>
							</div>
						</div>
					</div>

					<div class="col-sm-6 col-lg-3">
						<div class="card text-center h-100 border-0">
							<div class="card-body">
								<div class="text-primary mb-2">🎯</div>
								<h6 class="card-title">Personalisasi</h6>
								<p class="small text-muted">Menyediakan pengalaman yang relevan</p>
							</div>
						</div>
					</div>

					<div class="col-sm-6 col-lg-3">
						<div class="card text-center h-100 border-0">
							<div class="card-body">
								<div class="text-primary mb-2">💡</div>
								<h6 class="card-title">Rekomendasi</h6>
								<p class="small text-muted">Menyarankan kursus yang sesuai minat</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Data Retention -->
			<section class="mb-5">
				<h2 class="h3 mb-4">⏱️ Penyimpanan Data</h2>

				<div class="card border-0">
					<div class="card-body">
						<p>Kami menyimpan data pribadi Anda selama:</p>
						<ul>
							<li class="mb-2">Akun Anda aktif di platform</li>
							<li class="mb-2">Diperlukan untuk menyediakan layanan</li>
							<li class="mb-2">Diwajibkan oleh hukum atau regulasi</li>
							<li>Untuk tujuan bisnis yang sah</li>
						</ul>
						<p class="mt-3 mb-0">
							<strong>Anda dapat menghapus akun kapan saja</strong> melalui pengaturan akun. Data akan
							dihapus secara permanen sesuai dengan kebijakan retensi kami.
						</p>
					</div>
				</div>
			</section>

			<!-- Changes to Policy -->
			<section class="mb-5">
				<h2 class="h3 mb-4">🔄 Perubahan Kebijakan</h2>

				<div class="card border-0 bg-light">
					<div class="card-body">
						<p>
							Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan
							diberitahukan melalui:
						</p>
						<div class="row text-center">
							<!-- <div class="col-md-4 mb-3">
                <div class="text-primary mb-2">📧</div>
                <h6 class="fw-bold">Email</h6>
                <p class="small text-muted">Notifikasi langsung ke inbox Anda</p>
              </div> -->
							<div class="col-md-4 mb-3">
								<div class="text-primary mb-2">🔔</div>
								<h6 class="fw-bold">Platform Notifikasi</h6>
								<p class="small text-muted">Pemberitahuan dalam aplikasi</p>
							</div>
							<div class="col-md-4 mb-3">
								<div class="text-primary mb-2">🌐</div>
								<h6 class="fw-bold">Update Halaman</h6>
								<p class="small text-muted">Tanggal "Terakhir diperbarui" yang baru</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Final Note -->
			<div class="text-center mt-5">
				<div class="border-top pt-5">
					<p class="text-muted">
						Dengan menggunakan platform kami, Anda menyetujui pengumpulan dan penggunaan informasi
						sesuai dengan kebijakan privasi ini.
					</p>
					<p class="small text-muted">
						Terima kasih telah mempercayai kami dengan perjalanan belajar Anda.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	section {
		scroll-margin-top: 2rem;
	}

	.card {
		transition: transform 0.2s ease;
	}

	.card:hover {
		transform: translateY(-2px);
	}
</style>

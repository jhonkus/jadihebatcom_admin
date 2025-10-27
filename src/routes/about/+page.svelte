<script>
	import { Users, Target, TrendingUp, Globe } from 'lucide-svelte';
	
	// Data contoh untuk lowongan pekerjaan - commented out as not currently used
	/*
	let openPositions = [
		{
			id: 'content-creator',
			title: 'Content Creator',
			location: 'Remote',
			description:
				'Mengembangkan materi kursus interaktif dan menarik untuk pelajar di platform kami.',
			qualifications: [
				'Pengalaman dalam pengembangan konten pendidikan',
				'Kemampuan menulis dan mengedit yang sangat baik',
				'Familiar dengan alat desain seperti Canva atau Adobe Creative Suite'
			]
		},
		{
			id: 'frontend-developer',
			title: 'Frontend Developer',
			location: 'Jakarta, Indonesia',
			description:
				'Membangun dan memelihara antarmuka pengguna platform kursus online kami menggunakan SvelteKit.',
			qualifications: [
				'Pengalaman dengan JavaScript dan framework seperti Svelte atau React',
				'Pengetahuan tentang HTML, CSS, dan Bootstrap',
				'Kemampuan bekerja dalam tim lintas fungsi'
			]
		}
	];
	*/
</script>

<svelte:head>
	<title>Karier - Kursus Online</title>
</svelte:head>

<div class="container my-5">
	<div class="row justify-content-center">
		<div class="col-lg-10">
			<!-- Header -->
			<section class="text-center mb-5">
				<h1 class="mb-4">Bergabung dengan Tim Kami</h1>
				<p class="lead text-muted">
					Jadilah bagian dari misi kami untuk merevolusi pendidikan online dan memberdayakan banyak
					orang di Indonesia.
				</p>
			</section>

			<!-- About Us Section -->
			<section class="mb-5">
				<h2 class="mb-4">Tentang Kami</h2>
				<div class="row align-items-center">
					<div class="col-md-6">
						<p>
							Kami adalah platform kursus online yang berdedikasi untuk menyediakan pembelajaran
							berkualitas yang dapat diakses oleh siapa saja, di mana saja. Dengan tim yang penuh
							semangat dan inovatif, kami terus mengembangkan solusi pendidikan yang menginspirasi
							dan memberi dampak.
						</p>
						<p>
							Bergabung dengan kami berarti Anda akan bekerja bersama individu berbakat untuk
							menciptakan pengalaman belajar yang luar biasa, mulai dari pengembangan konten hingga
							teknologi mutakhir.
						</p>
					</div>
					<div class="col-md-6">
						<div class="card border-0 shadow-sm">
							<div class="card-body text-center">
								<Users class="display-4 text-primary mb-3" size="64" aria-hidden="true" />
								<h5 class="card-title">Tim Kami</h5>
								<p class="card-text">
									Kami adalah tim beragam yang bersatu untuk satu tujuan: membuat pendidikan lebih
									inklusif dan efektif.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Why Work With Us -->
			<section class="mb-5">
				<h2 class="mb-4">Mengapa Bergabung dengan Kami?</h2>
				<div class="row">
				<div class="col-md-4 mb-4">
					<div class="card h-100 border-0 shadow-sm">
						<div class="card-body text-center">
							<Target class="text-primary mb-3" size="32" aria-hidden="true" />
							<h5 class="card-title">Inovasi</h5>
							<p class="card-text">
								Kami mendorong kreativitas dan inovasi dalam setiap aspek pekerjaan, dari
								pengembangan kursus hingga teknologi.
							</p>
						</div>
					</div>
				</div>
				<div class="col-md-4 mb-4">
					<div class="card h-100 border-0 shadow-sm">
						<div class="card-body text-center">
							<TrendingUp class="text-primary mb-3" size="32" aria-hidden="true" />
								>
								<h5 class="card-title">Budaya Kolaboratif</h5>
								<p class="card-text">
									Bekerja dalam tim yang mendukung dan inklusif, di mana setiap ide dihargai.
								</p>
							</div>
						</div>
					</div>
				<div class="col-md-4 mb-4">
					<div class="card h-100 border-0 shadow-sm">
						<div class="card-body text-center">
							<Globe class="text-primary mb-3" size="32" aria-hidden="true" />
							<h5 class="card-title">Dampak Global</h5>
							<p class="card-text">
								Berkontribusi pada pendidikan global dengan menciptakan konten dan teknologi yang
								diakses jutaan orang.
							</p>
						</div>
					</div>
				</div>
				</div>
			</section>

			<!-- Open Positions -->
			<!-- <section class="mb-5">
				<h2 class="mb-4">Posisi yang Tersedia</h2>
				{#if openPositions.length > 0}
					<div class="accordion" id="jobsAccordion">
						{#each openPositions as job, index}
							<div class="accordion-item">
								<h2 class="accordion-header" id="heading{index}">
									<button
										class="accordion-button"
										type="button"
										data-bs-toggle="collapse"
										data-bs-target="#collapse{index}"
										aria-expanded={index === 0 ? 'true' : 'false'}
										aria-controls="collapse{index}"
									>
										{job.title} - {job.location}
									</button>
								</h2>
								<div
									id="collapse{index}"
									class="accordion-collapse collapse {index === 0 ? 'show' : ''}"
									aria-labelledby="heading{index}"
									data-bs-parent="#jobsAccordion"
								>
									<div class="accordion-body">
										<p><strong>Deskripsi:</strong> {job.description}</p>
										<p><strong>Kualifikasi:</strong></p>
										<ul>
											{#each job.qualifications as qual}
												<li>{qual}</li>
											{/each}
										</ul>
										<a href="/careers" class="btn btn-primary">Lamar Sekarang</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted">
						Saat ini tidak ada lowongan yang tersedia. Pantau terus halaman ini untuk pembaruan!
					</p>
				{/if}
			</section> -->

			<!-- Contact Form -->
			<!-- <section class="mb-5">
				<h2 class="mb-4">Hubungi Kami</h2>
				<p>
					Tidak menemukan posisi yang sesuai? Kirimkan informasi Anda, dan kami akan menghubungi
					Anda jika ada peluang yang cocok!
				</p>
				<form>
					<div class="mb-3">
						<label for="name" class="form-label">Nama Lengkap</label>
						<input
							type="text"
							class="form-control"
							id="name"
							placeholder="Masukkan nama lengkap Anda"
							required
						/>
					</div>
					<div class="mb-3">
						<label for="email" class="form-label">Email</label>
						<input
							type="email"
							class="form-control"
							id="email"
							placeholder="Masukkan email Anda"
							required
						/>
					</div>
					<div class="mb-3">
						<label for="message" class="form-label">Pesan atau Informasi Tambahan</label>
						<textarea
							class="form-control"
							id="message"
							rows="5"
							placeholder="Ceritakan tentang diri Anda atau posisi yang Anda minati"
							required
						></textarea>
					</div>
					<div class="mb-3">
						<label for="resume" class="form-label">Unggah CV/Resume (opsional)</label>
						<input type="file" class="form-control" id="resume" accept=".pdf,.doc,.docx" />
					</div>
					<button type="submit" class="btn btn-primary">Kirim</button>
				</form>
			</section> -->
		</div>
	</div>
</div>

<style>
	.card:hover {
		transform: translateY(-5px);
		transition: transform 0.2s;
	}
	:global(.accordion-button:not(.collapsed)) {
		background-color: #f8f9fa;
		color: #0d6efd;
	}
	svg {
		vertical-align: middle;
	}
</style>

<script lang="ts">
	// FAQ Categories
	const faqCategories = [
		{
			id: 'umum',
			title: 'Pertanyaan Umum',
			questions: [
				{
					q: 'Apa itu jadihebat.com?',
					a: 'jadihebat.com adalah platform kursus online yang menyediakan berbagai kursus teknologi dan skill development. Kami menawarkan pembelajaran berkualitas dari instruktur berpengalaman dengan harga terjangkau.'
				},
				{
					q: 'Apakah saya perlu pengalaman sebelumnya untuk mengikuti kursus?',
					a: 'Tidak harus. Kami menyediakan kursus untuk berbagai level, mulai dari Beginner (pemula) hingga Advanced (mahir). Setiap kursus memiliki label level yang jelas, sehingga kamu bisa memilih sesuai dengan kemampuanmu saat ini.'
				},
				{
					q: 'Berapa lama waktu akses kursus yang saya beli?',
					a: 'Setelah membeli kursus, kamu mendapatkan akses selamanya (lifetime access). Kamu bisa belajar kapan saja sesuai dengan waktu luangmu, tanpa batasan waktu.'
				},
				{
					q: 'Apakah ada sertifikat setelah menyelesaikan kursus?',
					a: 'Ya, setiap kursus yang berhasil kamu selesaikan akan mendapatkan sertifikat digital yang bisa kamu download dan bagikan di LinkedIn atau portfolio profesional kamu.'
				}
			]
		},
		{
			id: 'pembayaran',
			title: 'Pembayaran & Harga',
			questions: [
				{
					q: 'Metode pembayaran apa saja yang tersedia?',
					a: 'Kami menerima berbagai metode pembayaran termasuk: Transfer Bank (BCA, Mandiri, BNI, BRI), E-wallet (GoPay, OVO, Dana, ShopeePay), Kartu Kredit/Debit (Visa, Mastercard), dan QRIS.'
				},
				{
					q: 'Apakah ada biaya tambahan selain harga kursus?',
					a: 'Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final yang harus kamu bayar. Sudah termasuk akses penuh ke materi kursus, update materi, dan sertifikat.'
				},
				{
					q: 'Apakah ada diskon atau promo?',
					a: 'Kami sering memberikan promo spesial di momen-momen tertentu seperti hari raya, ulang tahun platform, atau flash sale. Subscribe newsletter kami untuk mendapatkan info promo terbaru.'
				},
				{
					q: 'Apakah ada kebijakan refund (pengembalian dana)?',
					a: 'Ya, kami menyediakan garansi uang kembali 30 hari. Jika kamu tidak puas dengan kursus yang dibeli dalam 30 hari pertama, kamu bisa mengajukan refund penuh tanpa pertanyaan.'
				}
			]
		},
		{
			id: 'teknis',
			title: 'Teknis & Akses',
			questions: [
				{
					q: 'Perangkat apa yang bisa digunakan untuk mengakses kursus?',
					a: 'Platform kami bisa diakses melalui web browser di komputer/laptop, tablet, dan smartphone. Kami juga memiliki aplikasi mobile untuk Android dan iOS untuk pengalaman belajar yang lebih nyaman.'
				},
				{
					q: 'Apakah perlu koneksi internet untuk mengikuti kursus?',
					a: 'Ya, kamu memerlukan koneksi internet untuk streaming video pembelajaran. Namun, di aplikasi mobile kami menyediakan fitur download materi untuk belajar offline.'
				},
				{
					q: 'Bagaimana cara mengakses kursus yang sudah dibeli?',
					a: 'Setelah pembayaran berhasil, kursus akan langsung muncul di dashboard "Kursus Saya". Kamu tinggal login ke akun dan mulai belajar. Kamu juga akan menerima email konfirmasi dengan link akses langsung.'
				},
				{
					q: 'Apakah materi kursus bisa didownload?',
					a: 'Video pembelajaran bisa didownload melalui aplikasi mobile untuk belajar offline. Materi pendukung seperti PDF, source code, dan resource lainnya bisa didownload langsung dari halaman kursus.'
				}
			]
		},
		{
			id: 'pembelajaran',
			title: 'Proses Pembelajaran',
			questions: [
				{
					q: 'Bagaimana format pembelajaran di platform ini?',
					a: 'Pembelajaran berbasis video on-demand yang bisa kamu tonton kapan saja. Setiap kursus terdiri dari beberapa section dengan video pembelajaran, materi pendukung, kuis, dan project praktik.'
				},
				{
					q: 'Apakah ada interaksi dengan instruktur?',
					a: 'Ya, setiap kursus memiliki forum diskusi (Q&A) di mana kamu bisa bertanya langsung ke instruktur atau berdiskusi dengan sesama pelajar. Instruktur biasanya merespon dalam 1-2 hari kerja.'
				},
				{
					q: 'Bagaimana cara tracking progress pembelajaran saya?',
					a: 'Dashboard kamu akan menampilkan progress bar untuk setiap kursus yang kamu ikuti. Kamu bisa melihat berapa persen kursus yang sudah diselesaikan, chapter mana yang sudah ditonton, dan badge yang sudah didapatkan.'
				},
				{
					q: 'Apakah ada deadline untuk menyelesaikan kursus?',
					a: 'Tidak ada deadline. Kamu belajar sesuai dengan pace kamu sendiri. Dengan lifetime access, kamu bisa pause dan lanjutkan pembelajaran kapan saja tanpa tekanan waktu.'
				}
			]
		},
		{
			id: 'akun',
			title: 'Akun & Profil',
			questions: [
				{
					q: 'Bagaimana cara membuat akun?',
					a: 'Klik tombol "Daftar" di pojok kanan atas, lalu isi form pendaftaran dengan email dan password. Kamu juga bisa daftar cepat menggunakan akun Google atau Facebook. Setelah itu, verifikasi email dan akun kamu siap digunakan.'
				},
				{
					q: 'Apakah bisa menggunakan satu akun untuk belajar di beberapa perangkat?',
					a: 'Ya, satu akun bisa login di maksimal 3 perangkat berbeda secara bersamaan. Namun, progress belajar akan otomatis tersinkronisasi di semua perangkat.'
				},
				{
					q: 'Bagaimana cara reset password jika lupa?',
					a: 'Klik "Lupa Password" di halaman login, masukkan email yang terdaftar, dan kami akan mengirimkan link reset password ke email kamu. Link tersebut berlaku 1 jam.'
				},
				{
					q: 'Bisakah saya mengubah informasi profil?',
					a: 'Ya, kamu bisa mengubah foto profil, nama, bio, dan informasi lainnya melalui halaman "Pengaturan Profil" di dashboard kamu.'
				}
			]
		},
		{
			id: 'lainnya',
			title: 'Lain-lain',
			questions: [
				{
					q: 'Bagaimana cara menghubungi customer support?',
					a: 'Kamu bisa menghubungi kami melalui email di support@jadihebat.com, live chat di website (jam kerja 09:00-17:00 WIB), atau WhatsApp di nomor +62 812-3456-7890. Kami biasanya merespon dalam 24 jam.'
				},
				{
					q: 'Apakah jadihebat.com menyediakan kursus gratis?',
					a: 'Ya, kami memiliki beberapa kursus gratis dan preview gratis untuk kursus berbayar. Kamu bisa filter kursus berdasarkan "Gratis" di halaman kursus untuk melihat pilihan yang tersedia.'
				},
				{
					q: 'Apakah ada program afiliasi atau referral?',
					a: 'Ya, kami memiliki program referral. Kamu akan mendapat komisi untuk setiap teman yang mendaftar dan membeli kursus melalui link referral kamu. Info lengkap bisa dilihat di halaman "Program Afiliasi".'
				},
				{
					q: 'Bagaimana cara memberikan review untuk kursus?',
					a: 'Setelah menyelesaikan minimal 30% dari kursus, kamu bisa memberikan rating dan review di halaman kursus tersebut. Review yang konstruktif sangat membantu instruktur dan calon pelajar lainnya.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>FAQ - Pertanyaan yang Sering Diajukan | jadihebat.com</title>
</svelte:head>

<!-- Hero Section -->
<section>
	<div class="container py-5">
		<div class="row justify-content-center">
			<div class="col-lg-8 text-center">
				<h1 class="display-4 fw-bold mb-3">Pertanyaan yang Sering Diajukan</h1>
				<p class="lead mb-0">
					Temukan jawaban untuk pertanyaan umum seputar platform, kursus, pembayaran, dan lainnya.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- FAQ Content -->
<section class="py-5">
	<div class="container">
		<!-- FAQ Categories -->
		<div class="row">
			<div class="col-lg-10 mx-auto">
				{#each faqCategories as category, categoryIndex}
					<div class="faq-category mb-5">
						<h2 class="faq-category-title mb-4">
							<span class="category-number">{categoryIndex + 1}.</span>
							{category.title}
						</h2>

						<div class="accordion" id="accordion-{category.id}">
							{#each category.questions as item, qIndex}
								<div class="accordion-item">
									<h3 class="accordion-header">
										<button
											class="accordion-button collapsed"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target="#collapse-{category.id}-{qIndex}"
											aria-expanded="false"
										>
											{item.q}
										</button>
									</h3>
									<div
										id="collapse-{category.id}-{qIndex}"
										class="accordion-collapse collapse"
										data-bs-parent="#accordion-{category.id}"
									>
										<div class="accordion-body">
											{item.a}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<!-- <section class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 text-center">
        <h2 class="h3 fw-bold mb-3">Masih Ada Pertanyaan?</h2>
        <p class="text-secondary mb-4">
          Tim kami siap membantu kamu. Jangan ragu untuk menghubungi kami!
        </p>
        <div class="d-flex gap-3 justify-content-center flex-wrap">
          <a href="/contact" class="btn btn-primary btn-lg">
            Hubungi Kami
          </a>
          <a href="/courses" class="btn btn-outline-primary btn-lg">
            Jelajahi Kursus
          </a>
        </div>
      </div>
    </div>
  </div>
</section> -->

<style>
	/* FAQ Category */
	.faq-category-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--bs-dark);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.category-number {
		color: var(--bs-primary);
		font-size: 2rem;
	}

	/* Accordion */
	.accordion-item {
		border: 2px solid var(--bs-border-color);
		border-radius: 0.75rem;
		margin-bottom: 1rem;
		overflow: hidden;
	}

	.accordion-item:last-child {
		margin-bottom: 0;
	}

	.accordion-button {
		font-weight: 600;
		font-size: 1.125rem;
		color: var(--bs-dark);
		background-color: white;
		border: none;
		padding: 1.25rem 1.5rem;
		transition: all 0.2s ease;
	}

	.accordion-button:not(.collapsed) {
		background-color: #f8f9ff;
		color: var(--bs-primary);
	}

	.accordion-button:hover {
		background-color: #f8f9ff;
	}

	.accordion-button:focus {
		box-shadow: none;
		border-color: transparent;
	}

	.accordion-button::after {
		background-image: none;
		content: '+';
		font-size: 1.5rem;
		font-weight: 400;
		color: var(--bs-primary);
		width: auto;
		height: auto;
		transform: none;
	}

	.accordion-button:not(.collapsed)::after {
		content: '−';
		transform: none;
	}

	.accordion-body {
		padding: 1.5rem;
		color: var(--bs-gray-700);
		line-height: 1.7;
		background-color: white;
		border-top: 1px solid var(--bs-border-color);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.faq-category-title {
			font-size: 1.5rem;
		}

		.category-number {
			font-size: 1.5rem;
		}

		.accordion-button {
			font-size: 1rem;
			padding: 1rem;
		}

		.accordion-body {
			padding: 1rem;
			font-size: 0.95rem;
		}
	}
</style>

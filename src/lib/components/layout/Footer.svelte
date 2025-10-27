<script>
	const currentYear = new Date().getFullYear();
</script>

<!-- Footer -->
<footer class="footer">
	<div class="footer-main">
		<div class="container py-5">
			<div class="row g-4">
				<!-- Brand -->
				<div class="col-lg-3 col-md-6">
					<div class="footer-brand">
						<a href="/" class="d-flex align-items-center mb-3">
							<span class="brand-text">
								<span class="brand-name">jadihebat</span><span class="brand-domain">.com</span>
							</span>
						</a>
						<p class="footer-description">
							Platform kursus online untuk belajar IT agar mampu survive di persaingan global.
						</p>

						<!-- <div class="social-links">
							<a href="https://facebook.com" class="social-link" aria-label="Facebook">
								<i class="fab fa-facebook-f"></i>
							</a>
							<a href="https://x.com" class="social-link" aria-label="Twitter / X">
								<i class="fab fa-x-twitter"></i>
							</a>
							<a href="https://instagram.com" class="social-link" aria-label="Instagram">
								<i class="fab fa-instagram"></i>
							</a>
							<a href="https://linkedin.com" class="social-link" aria-label="LinkedIn">
								<i class="fab fa-linkedin-in"></i>
							</a>
							<a href="https://youtube.com" class="social-link" aria-label="YouTube">
								<i class="fab fa-youtube"></i>
							</a>
						</div> -->
					</div>
				</div>

				<div class="col-lg-2 col-md-6 col-6"></div>
				<!-- Kategori -->
				<div class="col-lg-2 col-md-6 col-6">
					<h3 class="footer-title">Kategori</h3>
					<ul class="footer-links">
						<li><a href="/categories/pemrograman-web">Web Development</a></li>
						<li><a href="/categories/belajar-data-science">Data Science</a></li>
						<li><a href="/categories/belajar-blockchain">Blockchain</a></li>
						<li><a href="/categories/belajar-python">Python</a></li>
						<li><a href="/courses">Lihat Semua</a></li>
					</ul>
				</div>

				<!-- Perusahaan -->
				<div class="col-lg-2 col-md-6 col-6">
					<h3 class="footer-title">Perusahaan</h3>
					<ul class="footer-links">
						<li><a href="/blog">Blog</a></li>
						<li><a href="/faq">FAQ</a></li>
					</ul>
				</div>

				<!-- Support -->
				<div class="col-lg-3 col-md-6 col-6">
					<h3 class="footer-title">Support</h3>
					<ul class="footer-links">
						<li><a href="/terms">Syarat & Ketentuan</a></li>
						<li><a href="/privacy">Kebijakan Privasi</a></li>
						<!-- <li><a href="/refund">Kebijakan Refund</a></li> -->
						<li><a href="/help">Pusat Bantuan</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom -->
	<div class="footer-bottom">
		<div
			class="container py-3 d-flex flex-column flex-md-row justify-content-center align-items-center"
		>
			<p class="mb-2 mb-md-0 footer-copyright" style="color:whitesmoke">
				© {currentYear} <strong>jadihebat.com.</strong>&nbsp;&nbsp;All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: #1c1c1e;
		color: #fff;
		font-size: 0.95rem;
	}

	.footer a {
		text-decoration: none; /* 🔥 Hilangkan underline di semua link footer */
	}

	.footer-main {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.brand-text {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.brand-domain {
		color: var(--bs-primary);
	}

	.footer-description {
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 1.5rem;
	}

	.footer-title {
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		color: #fff;
		margin-bottom: 1rem;
	}

	.footer-links {
		list-style: none;
		padding: 0;
	}

	.footer-links a {
		color: rgba(255, 255, 255, 0.7);
		display: inline-block;
		transition: 0.2s;
	}

	.footer-links a:hover {
		color: var(--bs-primary);
		transform: translateX(3px);
	}

	.footer-bottom {
		background: #161618;
	}

	@media (max-width: 768px) {
		.footer-brand {
			text-align: center;
			justify-content: center;
		}
	}
</style>

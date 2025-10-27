<!-- src/lib/components/profile/MyCourses.svelte -->
<script lang="ts">
	import { Play, GraduationCap, Compass } from 'lucide-svelte';
</script>

<div class="card border-0 shadow-sm">
	<div class="card-header bg-transparent border-0 py-4">
		<h4 class="card-title mb-0 fw-bold">
			<Play size="24" class="me-2" aria-hidden="true" />
			Kursus Saya
		</h4>
	</div>
	<div class="card-body p-4">
		<div class="text-center py-5">
			<GraduationCap size="64" class="text-muted" aria-hidden="true" />
			<h5 class="mt-3 text-muted">Belum ada kursus</h5>
			<p class="text-muted mb-4">Mulai belajar dengan memilih kursus yang tersedia</p>
			<a href="/courses" class="btn btn-primary px-4">
				<Compass size="20" class="me-2" aria-hidden="true" />
				Jelajahi Kursus
			</a>
		</div>
	</div>
</div>

<style>
	.card {
		border-radius: 12px;
	}

	.btn-primary {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		border: none;
		border-radius: 8px;
	}
</style>

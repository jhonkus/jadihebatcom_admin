<!-- CourseCommonDetailsContent.svelte -->
<script>
	// Data untuk course details - mudah diubah dan maintain
	const courseDetails = {
		description:
			'This course covers the foundational principles of graphic design, including typography, layout, color theory, and branding. Ideal for beginners and those looking to refine their design skills with real-world projects.',
		topics: [
			['Introduction to Graphic Design', 'Basics of Typography', 'Color Theory and Applications'],
			[
				'Layout and Composition Techniques',
				'Branding and Visual Identity',
				'Real-World Design Projects'
			]
		]
	};
</script>

<div class="bd-course-feature-box mt-5" id="overview">
	<h3 class="bd-course-details-content-title mb-4">Course Details</h3>

	<!-- Container utama dengan kotak yang sama seperti komponen sebelumnya -->
	<div class="bg-light p-4 rounded-3">
		<p class="description mb-4">
			{courseDetails.description}
		</p>

		<div class="row">
			{#each courseDetails.topics as column, columnIndex (columnIndex)}
				<div class="col-lg-6">
					<div class="bd-post-details-list">
						<ul class="list-unstyled mb-0">
							{#each column as topic, topicIndex (topicIndex)}
								<li class="d-flex align-items-start mb-3">
									<span class="list-icon success me-3 mt-1">
										<i class="fas fa-circle text-success" style="font-size: 8px;"></i>
									</span>
									<span class="text-dark">
										{topic}
									</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

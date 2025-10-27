<script lang="ts">
	import type { Course } from '$lib/types/course';
	import { goto } from '$app/navigation';
	import { enrollFreeCourse, checkEnrollment } from '$lib/services/enrollmentService';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { fetchCurrentUser } from '$lib/utils/auth';
	import {
		Calendar,
		Globe,
		BookOpen,
		Play,
		LogIn,
		ShoppingCart,
		CreditCard,
		Star
	} from 'lucide-svelte';

	export let course: Course;
	export let courseBreadcrumbBuyShow = false;
	export let sections: any[] = [];

	let isEnrolling = false;
	let enrollmentError = '';
	let isAlreadyEnrolled = false;
	let checkingEnrollment = true;
	let user: { id: string } | null = null;

	onMount(async () => {
		if (!browser) return;

		try {
			user = await fetchCurrentUser();
			if (user && course.id) {
				// Check enrollment status (fails silently if auth is invalid)
				isAlreadyEnrolled = await checkEnrollment(course.id);
			}
		} catch {
			// console.error('Failed to check enrollment:', error);
			// Reset user if there's an error (likely stale cookie)
			user = null;
			isAlreadyEnrolled = false;
		} finally {
			checkingEnrollment = false;
		}
	});

	async function handleEnroll() {
		if (!browser) return;

		if (!user) {
			goto(`/login?redirect=/courses/${course.slug}`);
			return;
		}
		if (isAlreadyEnrolled) {
			goto(`/learning/${course.slug}`);
			return;
		}

		isEnrolling = true;
		enrollmentError = '';

		try {
			const result = await enrollFreeCourse(course.id);

			if (result.success) {
				// Update local state and redirect
				isAlreadyEnrolled = true;
				goto(`/learning/${course.slug}`);
			} else {
				enrollmentError = result.error || 'Failed to enroll';

				// Redirect to login if unauthorized
				if (result.error?.includes('login')) {
					goto(`/login?redirect=/courses/${course.slug}`);
				}
			}
		} catch {
			// console.error('Enrollment error:', error);
			enrollmentError = 'An unexpected error occurred';
		}

		isEnrolling = false;
	}

	function formatPrice(price: string, isFree: boolean): string {
		if (isFree) return 'Free';
		return `$${parseFloat(price).toFixed(2)}`;
	}

	function formatDate(dateString: string): string {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	// 🧩 Added — compute sections, lessons, and total duration
	$: totalLessons = sections.reduce((sum, section) => sum + (section.lessons?.length || 0), 0);

	$: totalDuration = sections.reduce(
		(sum, section) =>
			sum +
			section.lessons?.reduce(
				(s: any, l: { estimated_duration: any }) => s + (l.estimated_duration || 0),
				0
			),
		0
	);

	function formatTotalDuration(minutes: number): string {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
	}
</script>

<section class="bd-course-breadcrumb-area section-space">
	<div class="container">
		<div
			class="row {courseBreadcrumbBuyShow
				? 'gy-30 align-items-center justify-content-between'
				: ''}"
		>
			<div class="col-xl-8 col-lg-8 col-md-12">
				<div class="bd-course-breadcrumb-wrapper">
					<div class="bd-course-breadcrumb-content">
						<h2 class="bd-course-breadcrumb-title mb-3">{course.title}</h2>
						<p class="bd-course-breadcrumb-description">
							{course.short_description || course.short_description || 'No description available.'}
						</p>

						<!-- <div class="bd-course-details-meta border-padding-none mb-4">
							<div class="bd-course-author">
								<div class="authour-meta">
									<span class="subtitle text-muted">Created by</span>
									<div class="name">
										<a href="/instructor/{course.instructor_id}" class="fw-semibold text-dark">
											{instructorName}
										</a>
									</div>
								</div>
							</div>
						</div> -->

						<!-- Date, Language & Reading Time -->
						<div class="d-flex align-items-center gap-4 mb-4 flex-wrap text-muted small">
							<div class="d-flex align-items-center gap-2">
								<Calendar size="16" class="gradient-icon" aria-hidden="true" />
								<span>Last Update: {formatDate(course.updated_at)}</span>
							</div>
							<div class="d-flex align-items-center gap-2">
								<Globe size="16" class="gradient-icon" aria-hidden="true" />
								<span>Language: {course.language}</span>
							</div>
							{#if totalDuration}
								<div class="d-flex align-items-center gap-2">
									<BookOpen size="16" class="gradient-icon" aria-hidden="true" />
									<span
										>{sections.length} Sections · {totalLessons} Lessons · {formatTotalDuration(
											totalDuration
										)}</span
									>
								</div>
							{/if}
						</div>

						<!-- Rating -->
						<!-- <div class="bd-course-add-time d-flex align-items-center gap-4">
							<div class="bd-course-details-rating rating-spacing">
								<span class="fw-bold text-dark">{rating.toFixed(1)}</span>
								<ul class="list-inline d-inline-block mb-0">
									{#each stars as filled}
										<li class="list-inline-item">
											<Star size="20" class="gradient-icon {filled ? '' : 'text-muted'}" fill={filled ? 'currentColor' : 'none'} aria-hidden="true" />
										</li>
									{/each}
								</ul>
								<span class="text-muted">({course.rating_count} reviews)</span>
							</div>
						</div> -->
					</div>
				</div>
			</div>

			{#if courseBreadcrumbBuyShow}
				<div class="col-xl-4 col-lg-5 col-md-12">
					<div class="bd-course-breadcrumb-buy">
						<div class="bd-course-sidebar-widget transparent">
							<div class="bd-course-sidebar-widget-price mb-4">
								<div class="d-flex justify-content-between align-items-center mb-2">
									<div class="bd-course-price">
										<span class="current-price h4 text-gradient">
											{formatPrice(course.price, course.is_free)}
										</span>
										{#if course.featured}
											<span class="badge badge-gradient ms-2">Featured</span>
										{/if}
									</div>
									{#if course.is_free}
										<span class="badge bg-success">Free Course</span>
									{/if}
								</div>
							</div>

							{#if enrollmentError}
								<div class="alert alert-danger" role="alert">
									{enrollmentError}
								</div>
							{/if}

							<div class="bd-course-sidebar-widget-btn">
								{#if course.is_free}
									{#if checkingEnrollment}
										<button class="btn btn-gradient w-100 py-2 fw-medium" disabled>
											<span class="spinner-border spinner-border-sm me-2"></span>
											Checking...
										</button>
									{:else if isAlreadyEnrolled}
										<a href="/learning/{course.slug}" class="btn btn-gradient w-100 py-2 fw-medium">
											<Play size="18" style="vertical-align: middle;" aria-hidden="true" />
											Continue Learning
										</a>
									{:else}
										<button
											onclick={handleEnroll}
											class="btn btn-gradient w-100 py-2 fw-medium"
											disabled={isEnrolling}
										>
											{#if isEnrolling}
												<span class="spinner-border spinner-border-sm me-2"></span>
												Enrolling...
											{:else}
												<LogIn size="18" style="vertical-align: middle;" aria-hidden="true" />
												Enroll for Free
											{/if}
										</button>
									{/if}
								{:else}
									<a
										href="/cart?course={course.id}"
										class="btn btn-gradient w-100 mb-3 py-2 fw-medium"
									>
										<ShoppingCart size="18" style="vertical-align: middle;" aria-hidden="true" />
										Add to Cart
									</a>
									<a
										href="/checkout?course={course.id}"
										class="btn btn-outline-gradient w-100 py-2 fw-medium"
									>
										<CreditCard size="18" style="vertical-align: middle;" aria-hidden="true" />
										Buy Now
									</a>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.section-space {
		padding: 3rem 0;
	}

	/* 🔵 Beautiful blue gradient background matching blog/courses header */
	.bd-course-breadcrumb-area {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: #ffffff;
		padding: 4rem 0;
		border-bottom: 1px solid rgba(59, 130, 246, 0.2);
	}

	.bd-course-breadcrumb-title {
		color: #ffffff;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		font-weight: 700;
	}

	.bd-course-breadcrumb-description {
		color: rgba(255, 255, 255, 0.9);
		max-width: 700px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
	}

	.gradient-icon {
		color: #ffffff;
		background: none;
		background-clip: initial;
		-webkit-background-clip: initial;
		-webkit-text-fill-color: initial;
		vertical-align: middle;
		opacity: 0.9;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.text-gradient {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		font-weight: 700;
		text-shadow: none;
	}

	/* Override text-muted for better contrast on dark blue background */
	.bd-course-breadcrumb-area .text-muted {
		color: rgba(255, 255, 255, 0.8) !important;
	}

	.bd-course-breadcrumb-area .small {
		color: rgba(255, 255, 255, 0.75);
	}

	/* Buttons - Enhanced for better visibility on dark blue background */
	.btn-gradient {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		font-weight: 600;
		font-size: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.3s ease;
	}
	.btn-gradient:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.3);
	}

	.btn-outline-gradient {
		background: transparent;
		border: 2px solid rgba(255, 255, 255, 0.8);
		color: #ffffff;
		border-radius: 8px;
		font-weight: 600;
		font-size: 16px;
		transition: all 0.3s ease;
	}
	.btn-outline-gradient:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		border-color: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	/* Badge - Enhanced visibility on dark blue background */
	.badge-gradient {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.3);
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
	}

	/* Success badge override for dark blue background */
	.bd-course-breadcrumb-area .badge.bg-success {
		background-color: rgba(16, 185, 129, 0.8) !important;
		color: #ffffff;
		border: 1px solid rgba(16, 185, 129, 0.5);
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
		backdrop-filter: blur(10px);
	}

	/* Sidebar widget on dark blue background */
	.bd-course-breadcrumb-area .bd-course-sidebar-widget {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		padding: 2rem;
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.bd-course-breadcrumb-area .bd-course-sidebar-widget.transparent {
		background: rgba(255, 255, 255, 0.95);
	}

	/* Text inside sidebar widget should be blue gradient */
	.bd-course-breadcrumb-area .bd-course-sidebar-widget .text-gradient {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		text-shadow: none;
	}

	.bd-course-breadcrumb-area .bd-course-sidebar-widget .current-price {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		font-weight: 700;
	}

	/* Buttons inside sidebar widget - vibrant blue gradient */
	.bd-course-breadcrumb-area .bd-course-sidebar-widget .btn-gradient {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.bd-course-breadcrumb-area .bd-course-sidebar-widget .btn-gradient:hover {
		background: linear-gradient(45deg, #2563eb, #1d4ed8);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
		color: #ffffff;
	}

	.bd-course-breadcrumb-area .bd-course-sidebar-widget .btn-outline-gradient {
		background: transparent;
		border: 2px solid #3b82f6;
		color: #3b82f6;
	}

	.bd-course-breadcrumb-area .bd-course-sidebar-widget .btn-outline-gradient:hover {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		color: #ffffff;
		border-color: transparent;
	}

	/* Badges inside sidebar widget */
	.bd-course-breadcrumb-area .bd-course-sidebar-widget .badge-gradient {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		color: #ffffff;
		border: none;
	}

	.bd-course-breadcrumb-area .bd-course-sidebar-widget .badge.bg-success {
		background-color: #28a745 !important;
		color: #ffffff;
		border: none;
	}

	/* Alert styles for dark blue background */
	.bd-course-breadcrumb-area .alert {
		background: rgba(220, 53, 69, 0.15);
		border: 1px solid rgba(220, 53, 69, 0.4);
		color: #ff6b7d;
		backdrop-filter: blur(10px);
	}
</style>

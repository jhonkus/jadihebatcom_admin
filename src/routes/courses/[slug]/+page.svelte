<script lang="ts">
	import type { Course, CourseInfo, Section } from '$lib/types/course';
	import CommonCourseFeature from '$lib/components/course-detail/CommonCourseFeature.svelte';
	import WhatYouLearn from '$lib/components/course-detail/WhatYouLearn.svelte';
	import CourseDetailsBreadcrumb from '$lib/components/course-detail/CourseDetailsBreadcrumb.svelte';
	import CourseContentDropdown from '$lib/components/course-detail/CourseContentDropdown.svelte';

	export let data: {
		course: Course;
		courseInfo: CourseInfo | null;
		sections: Section[];
	};

	const { course, courseInfo, sections } = data;
</script>

<svelte:head>
	<title>{course.title} | jadihebat</title>
</svelte:head>

<CourseDetailsBreadcrumb {course} {sections} courseBreadcrumbBuyShow={true} />

<div class="container mt-4 mb-5">
	<div class="row justify-content-center">
		<div class="col-lg-10">
			<CommonCourseFeature {course} />
		</div>
	</div>
</div>

<div class="container mt-5 mb-5">
	<div class="row justify-content-center">
		<div class="col-lg-10">
			<WhatYouLearn {courseInfo} {course} />
			<div class="mb-5"></div>
			<CourseContentDropdown {sections} />
		</div>
	</div>
</div>

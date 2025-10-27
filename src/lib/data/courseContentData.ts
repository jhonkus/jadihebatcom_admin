export const courseContentData = [
	{
		id: '1',
		title: 'Introduction to Web Development',
		order_index: 1,
		is_active: true,
		lessons: [
			{
				id: '1',
				title: 'What is Web Development?',
				slug: 'what-is-web-development',
				content: 'Introduction content...',
				order_index: 1,
				estimated_duration: 600, // 10 minutes in seconds
				is_free: true,
				is_active: true
			},
			{
				id: '2',
				title: 'Setting up your development environment',
				slug: 'setting-up-environment',
				content: 'Environment setup content...',
				order_index: 2,
				estimated_duration: 900, // 15 minutes
				is_free: false,
				is_active: true
			}
		]
	},
	{
		id: '2',
		title: 'HTML Fundamentals',
		order_index: 2,
		is_active: true,
		lessons: [
			{
				id: '3',
				title: 'HTML Basics',
				slug: 'html-basics',
				content: 'HTML basics content...',
				order_index: 1,
				estimated_duration: 1200, // 20 minutes
				is_free: true,
				is_active: true
			}
		]
	}
];

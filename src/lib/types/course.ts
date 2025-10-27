export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	is_active: boolean;
	icon_name?: string;
	icon_color?: string;
	back_color?: string;
	totalCourses?: number;
	sort_order: number;
	created_at: string;
	updated_at: string;
	parent_id?: string | null;
}

export interface PageData {
	courses: Course[];
	total: number;
	page: number;
	limit: number;
}

export interface CourseFilters {
	category?: string;
	level?: string;
	price?: string;
	search?: string;
	sort?: string;
	page?: number;
}

export interface Instructor {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
}

export interface CourseInfo {
	id: string;
	course_id: string;
	what_learn: string;
	requirements: string;
	descriptions: string;
	includes: string;
	tags: string;
	level: string;
	lectures: number;
	duration: string;
	category: string;
	language: string;
	access: string;
	certificate: string;
	resources: number;
}

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
}

export interface Course {
	id: string;
	title: string;
	slug: string;
	description?: string;
	short_description?: string;
	what_will_learn?: string;
	requirements?: string;
	thumbnail?: string;
	thumbnail_url?: string;
	icon_name?: string;
	icon_color?: string;
	back_color?: string;
	price: string;
	is_free: boolean;
	difficulty_level: 'beginner' | 'intermediate' | 'advanced';
	estimated_duration: string;
	language: string;
	status: 'draft' | 'published' | 'archived';
	featured: boolean;
	enrollment_count: number;
	rating_average: string;
	rating_count: number;
	created_at: string;
	updated_at: string;
	published_at?: string;

	// 🔽 many-to-one: bisa berupa objek Category atau ID string
	category_id: Category;

	// 🔽 many-to-one: bisa berupa objek Instructor atau ID string
	instructor_id: Instructor;

	// 🔽 one-to-many (optional): daftar sections (kalau di-query nested)
	// course_sections?: Section[];
	course_sections?: Section[] | null;
}

export interface Article {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content?: string;
	author_id?: string;
	image_url?: string;
	status: string;
	created_at: string;
	updated_at: string;
	categories_id: BlogCategory[];
}

export interface BlogCategory {
	id: string;
	name: string;
	slug: string;
	status: string;
}

export interface Section {
	id: string;
	title: string;
	slug: string;
	description?: string;
	order_index: number;
	is_active: boolean;

	// 🔽 many-to-one ke Course (bisa ID string atau object)
	course_id: Course | string;

	// 🔽 one-to-many ke Lesson
	// lessons?: Lesson[];
	lessons?: Lesson[] | null; // 🧩 tambahkan null juga
}

export interface Lesson {
	id: string;
	title: string;
	slug: string;
	content: string;
	summary?: string;
	order_index: number;
	estimated_duration: number;
	is_free: boolean;
	is_active: boolean;

	// 🔽 many-to-one ke Section
	section_id: Section | string;
}

export interface Enrollment {
	id: string;
	user_id: string;
	course_id: string | Course;
	enrolled_at: string;
	status: 'active' | 'completed' | 'cancelled';
	progress: number; // Changed from progress_percentage to match DB schema
	completed_at?: string;
	// Note: last_accessed_at removed - not in DB schema
}

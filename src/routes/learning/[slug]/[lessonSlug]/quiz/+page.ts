// src/routes/learning/[slug]/[lessonSlug]/quiz/+page.ts
import type { Course, Lesson } from '$lib/types/course';

export interface QuizQuestion {
	id: string;
	question: string;
	options: {
		id: string;
		text: string;
		value: string;
	}[];
	correctAnswer: string;
}

export interface Quiz {
	id: string;
	title: string;
	description: string;
	questions: QuizQuestion[];
	timeLimit: number; // in minutes
	passingScore: number; // percentage
}

export interface PageData {
	course: Course | null;
	lesson: Lesson | null;
	quiz: Quiz | null;
	error?: string;
	isEnrolled?: boolean;
}

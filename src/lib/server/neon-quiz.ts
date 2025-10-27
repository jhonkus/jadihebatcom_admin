// src/lib/server/neon-quiz.ts - Neon PostgreSQL access for quiz data
import { neon } from '@neondatabase/serverless';

// Database client for quiz
let quizDbClient: ReturnType<typeof neon> | null = null;

async function getQuizDbClient() {
	if (!quizDbClient) {
		// lazy load environment variables
		const { NEON_DB_URL } = await import('$env/static/private');
		quizDbClient = neon(NEON_DB_URL);
	}
	return quizDbClient;
}

// Quiz data types
export interface QuizRow {
	id: number;
	lesson_id: string;
	title: string;
	description: string;
	passing_score: number;
	max_attempts: number;
	time_limit: number | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface QuizQuestionRow {
	id: number;
	quiz_id: number;
	question_text: string;
	question_type: string;
	order_index: number;
	points: number;
	explanation?: string;
	created_at: string;
}

export interface QuizQuestionOptionRow {
	id: number;
	question_id: number;
	option_text: string;
	is_correct: boolean;
	order_index: number;
	created_at: string;
}

export interface QuizAttemptRow {
	id: number;
	user_id: string;
	quiz_id: number;
	score: number | null;
	max_score: number;
	passed: boolean;
	started_at: string;
	completed_at: string | null;
	time_taken: number | null;
}

export interface QuizAttemptAnswerRow {
	id: number;
	attempt_id: number;
	question_id: number;
	selected_option_id: number | null;
	answer_text: string | null;
	is_correct: boolean;
	points_earned: number;
}

// Transform functions
function transformQuizQuestion(questionRow: QuizQuestionRow, options: QuizQuestionOptionRow[]) {
	return {
		id: `q${questionRow.id}`,
		question: questionRow.question_text,
		options: options
			.sort((a, b) => a.order_index - b.order_index)
			.map((option) => ({
				id: `opt${option.id}`,
				text: option.option_text,
				value: `opt${option.id}`
			})),
		correctAnswer: options.find((opt) => opt.is_correct)?.id
			? `opt${options.find((opt) => opt.is_correct)!.id}`
			: ''
	};
}

function transformQuiz(
	quizRow: QuizRow,
	questions: QuizQuestionRow[],
	allOptions: QuizQuestionOptionRow[]
) {
	return {
		id: `quiz-${quizRow.id}`,
		title: quizRow.title,
		description: quizRow.description,
		questions: questions
			.sort((a, b) => a.order_index - b.order_index)
			.map((question) => {
				const questionOptions = allOptions.filter((opt) => opt.question_id === question.id);
				return transformQuizQuestion(question, questionOptions);
			}),
		timeLimit: quizRow.time_limit || 15, // default 15 minutes
		passingScore: quizRow.passing_score
	};
}

// Fetch quiz by lesson ID
export async function fetchQuizByLessonId(lessonId: string) {
	try {
		const sql = await getQuizDbClient();

		// First, get the quiz
		const quizResult = (await sql`
			SELECT * FROM quizzes 
			WHERE lesson_id = ${lessonId} AND is_active = true 
			LIMIT 1
		`) as QuizRow[];

		if (quizResult.length === 0) {
			return null;
		}

		const quizRow = quizResult[0];

		// Then, get the questions for this quiz
		const questions = (await sql`
			SELECT * FROM quiz_questions 
			WHERE quiz_id = ${quizRow.id} 
			ORDER BY order_index ASC
		`) as QuizQuestionRow[];

		// Get all options for these questions
		const questionIds = questions.map((q) => q.id);
		if (questionIds.length === 0) {
			return transformQuiz(quizRow, [], []);
		}

		const options = (await sql`
			SELECT * FROM quiz_question_options 
			WHERE question_id = ANY(${questionIds}) 
			ORDER BY question_id, order_index ASC
		`) as QuizQuestionOptionRow[];

		return transformQuiz(quizRow, questions, options);
	} catch (error) {
		console.error('Error fetching quiz by lesson ID:', error);
		return null;
	}
}

// Fetch all quizzes (for admin purposes)
export async function fetchAllQuizzes() {
	try {
		const sql = await getQuizDbClient();

		const result = (await sql`
			SELECT q.*, COUNT(qq.id) as question_count
			FROM quizzes q
			LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
			WHERE q.is_active = true
			GROUP BY q.id
			ORDER BY q.created_at DESC
		`) as Array<QuizRow & { question_count: number }>;

		return result;
	} catch (error) {
		console.error('Error fetching all quizzes:', error);
		return [];
	}
}

// Quiz attempt tracking functions

// Create a new quiz attempt
export async function createQuizAttempt(userId: string, quizId: number): Promise<number | null> {
	try {
		const sql = await getQuizDbClient();

		// First get max_score by calculating total points
		const maxScoreResult = (await sql`
			SELECT COALESCE(SUM(points), 0) as max_score
			FROM quiz_questions
			WHERE quiz_id = ${quizId}
		`) as Array<{ max_score: number }>;

		const maxScore = maxScoreResult[0]?.max_score || 0;

		const result = (await sql`
			INSERT INTO quiz_attempts (user_id, quiz_id, max_score, passed, started_at)
			VALUES (${userId}, ${quizId}, ${maxScore}, false, NOW())
			RETURNING id
		`) as Array<{ id: number }>;

		if (result.length > 0) {
			return result[0].id;
		}

		return null;
	} catch (error) {
		console.error('Error creating quiz attempt:', error);
		return null;
	}
}

// Record an answer for a quiz attempt
export async function recordQuizAnswer(
	attemptId: number,
	questionId: number,
	selectedOptionId: number | null,
	answerText: string | null = null
): Promise<boolean> {
	try {
		const sql = await getQuizDbClient();

		// Check if the selected option is correct
		let isCorrect = false;
		let pointsEarned = 0;

		if (selectedOptionId) {
			const optionResult = (await sql`
				SELECT is_correct FROM quiz_question_options 
				WHERE id = ${selectedOptionId}
			`) as Array<{ is_correct: boolean }>;

			if (optionResult.length > 0) {
				isCorrect = optionResult[0].is_correct;
			}
		}

		// Get points for this question
		const questionResult = (await sql`
			SELECT points FROM quiz_questions 
			WHERE id = ${questionId}
		`) as Array<{ points: number }>;

		if (questionResult.length > 0 && isCorrect) {
			pointsEarned = questionResult[0].points;
		}

		// Insert the answer
		await sql`
			INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct, points_earned)
			VALUES (${attemptId}, ${questionId}, ${selectedOptionId}, ${answerText}, ${isCorrect}, ${pointsEarned})
		`;

		return true;
	} catch (error) {
		console.error('Error recording quiz answer:', error);
		return false;
	}
}

// Complete a quiz attempt with final results
export async function completeQuizAttempt(
	attemptId: number,
	score: number,
	timeTaken: number
): Promise<boolean> {
	try {
		const sql = await getQuizDbClient();

		// Get the quiz passing score
		const attemptResult = (await sql`
			SELECT q.passing_score 
			FROM quiz_attempts qa 
			JOIN quizzes q ON qa.quiz_id = q.id 
			WHERE qa.id = ${attemptId}
		`) as Array<{ passing_score: number }>;

		let passed = false;
		if (attemptResult.length > 0) {
			const passingScore = attemptResult[0].passing_score;
			passed = score >= passingScore;
		}

		await sql`
			UPDATE quiz_attempts 
			SET score = ${score}, passed = ${passed}, completed_at = NOW(), time_taken = ${timeTaken}
			WHERE id = ${attemptId}
		`;

		return true;
	} catch (error) {
		console.error('Error completing quiz attempt:', error);
		return false;
	}
}

// Get user's quiz attempts for a specific quiz
export async function getUserQuizAttempts(
	userId: string,
	quizId: number
): Promise<QuizAttemptRow[]> {
	try {
		const sql = await getQuizDbClient();

		const result = (await sql`
			SELECT * FROM quiz_attempts 
			WHERE user_id = ${userId} AND quiz_id = ${quizId} 
			ORDER BY started_at DESC
		`) as QuizAttemptRow[];

		return result;
	} catch (error) {
		console.error('Error fetching user quiz attempts:', error);
		return [];
	}
}

// Check if user can attempt quiz (max 2 attempts)
export async function canUserAttemptQuiz(userId: string, quizId: number): Promise<boolean> {
	try {
		const attempts = await getUserQuizAttempts(userId, quizId);
		return attempts.length < 2;
	} catch (error) {
		console.error('Error checking quiz attempt limit:', error);
		return false;
	}
}

// Get user's best score for a quiz
export async function getUserBestScore(
	userId: string,
	quizId: number
): Promise<{ score: number; passed: boolean } | null> {
	try {
		const attempts = await getUserQuizAttempts(userId, quizId);
		if (attempts.length === 0) return null;

		// Find the attempt with the highest score
		const bestAttempt = attempts.reduce((best, current) => {
			if (!best.score && !current.score) return best;
			if (!best.score) return current;
			if (!current.score) return best;
			return current.score > best.score ? current : best;
		});

		return {
			score: bestAttempt.score || 0,
			passed: bestAttempt.passed
		};
	} catch (error) {
		console.error('Error getting user best score:', error);
		return null;
	}
}

// Get user's best score for a quiz by lesson ID
export async function getUserBestScoreByLessonId(
	userId: string,
	lessonId: string
): Promise<{ score: number; passed: boolean } | null> {
	try {
		const sql = await getQuizDbClient();

		// First, get the quiz ID for this lesson
		const quizResult = (await sql`
			SELECT id FROM quizzes 
			WHERE lesson_id = ${lessonId} AND is_active = true 
			LIMIT 1
		`) as Array<{ id: number }>;

		if (quizResult.length === 0) {
			return null; // No quiz for this lesson
		}

		const quizId = quizResult[0].id;

		// Now get the best score for this quiz
		return await getUserBestScore(userId, quizId);
	} catch (error) {
		console.error('Error getting user best score by lesson ID:', error);
		return null;
	}
}

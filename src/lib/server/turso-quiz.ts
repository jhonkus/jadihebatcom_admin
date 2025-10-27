// src/lib/server/turso-quiz.ts - TursoDB direct access for quiz data
import { createClient } from '@libsql/client';

// Database client for quiz
let quizDbClient: any = null;

async function getQuizDbClient() {
	if (!quizDbClient) {
		// lazy load environment variables
		const { TRS_QUIZ_DATABASE_URL, TRS_QUIZ_AUTH_TOKEN } = await import('$env/static/private');
		quizDbClient = createClient({
			url: TRS_QUIZ_DATABASE_URL,
			authToken: TRS_QUIZ_AUTH_TOKEN
		});
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
		const db = await getQuizDbClient();

		// First, get the quiz
		const quizResult = await db.execute({
			sql: `SELECT * FROM quizzes WHERE lesson_id = ? AND is_active = 1 LIMIT 1`,
			args: [lessonId]
		});

		if (quizResult.rows.length === 0) {
			return null;
		}

		const quizRow = quizResult.rows[0] as QuizRow;

		// Then, get the questions for this quiz
		const questionsResult = await db.execute({
			sql: `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC`,
			args: [quizRow.id]
		});

		const questions = questionsResult.rows as QuizQuestionRow[];

		// Get all options for these questions
		const questionIds = questions.map((q) => q.id);
		if (questionIds.length === 0) {
			return transformQuiz(quizRow, [], []);
		}

		const placeholders = questionIds.map(() => '?').join(',');
		const optionsResult = await db.execute({
			sql: `SELECT * FROM quiz_question_options WHERE question_id IN (${placeholders}) ORDER BY question_id, order_index ASC`,
			args: questionIds
		});

		const options = optionsResult.rows as QuizQuestionOptionRow[];

		return transformQuiz(quizRow, questions, options);
	} catch (error) {
		console.error('Error fetching quiz by lesson ID:', error);
		return null;
	}
}

// Fetch all quizzes (for admin purposes)
export async function fetchAllQuizzes() {
	try {
		const db = await getQuizDbClient();

		const result = await db.execute({
			sql: `SELECT q.*, COUNT(qq.id) as question_count
			      FROM quizzes q
			      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
			      WHERE q.is_active = 1
			      GROUP BY q.id
			      ORDER BY q.created_at DESC`,
			args: []
		});

		return result.rows;
	} catch (error) {
		console.error('Error fetching all quizzes:', error);
		return [];
	}
}

// Quiz attempt tracking functions

// Create a new quiz attempt
export async function createQuizAttempt(userId: string, quizId: number): Promise<number | null> {
	try {
		const db = await getQuizDbClient();

		const result = await db.execute({
			sql: `INSERT INTO quiz_attempts (user_id, quiz_id, max_score, passed, started_at)
			      VALUES (?, ?, (SELECT COUNT(*) * (SELECT points FROM quiz_questions WHERE quiz_id = ? LIMIT 1) FROM quiz_questions WHERE quiz_id = ?), FALSE, CURRENT_TIMESTAMP)
			      RETURNING id`,
			args: [userId, quizId, quizId, quizId]
		});

		if (result.rows.length > 0) {
			return (result.rows[0] as any).id;
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
		const db = await getQuizDbClient();

		// Check if the selected option is correct
		let isCorrect = false;
		let pointsEarned = 0;

		if (selectedOptionId) {
			const optionResult = await db.execute({
				sql: `SELECT is_correct FROM quiz_question_options WHERE id = ?`,
				args: [selectedOptionId]
			});

			if (optionResult.rows.length > 0) {
				isCorrect = (optionResult.rows[0] as any).is_correct;
			}
		}

		// Get points for this question
		const questionResult = await db.execute({
			sql: `SELECT points FROM quiz_questions WHERE id = ?`,
			args: [questionId]
		});

		if (questionResult.rows.length > 0 && isCorrect) {
			pointsEarned = (questionResult.rows[0] as any).points;
		}

		// Insert the answer
		await db.execute({
			sql: `INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct, points_earned)
			      VALUES (?, ?, ?, ?, ?, ?)`,
			args: [attemptId, questionId, selectedOptionId, answerText, isCorrect, pointsEarned]
		});

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
		const db = await getQuizDbClient();

		// Get the quiz passing score
		const attemptResult = await db.execute({
			sql: `SELECT q.passing_score FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.id = ?`,
			args: [attemptId]
		});

		let passed = false;
		if (attemptResult.rows.length > 0) {
			const passingScore = (attemptResult.rows[0] as any).passing_score;
			passed = score >= passingScore;
		}

		await db.execute({
			sql: `UPDATE quiz_attempts SET score = ?, passed = ?, completed_at = CURRENT_TIMESTAMP, time_taken = ? WHERE id = ?`,
			args: [score, passed, timeTaken, attemptId]
		});

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
		const db = await getQuizDbClient();

		const result = await db.execute({
			sql: `SELECT * FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY started_at DESC`,
			args: [userId, quizId]
		});

		return result.rows as QuizAttemptRow[];
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
		const db = await getQuizDbClient();

		// First, get the quiz ID for this lesson
		const quizResult = await db.execute({
			sql: `SELECT id FROM quizzes WHERE lesson_id = ? AND is_active = 1 LIMIT 1`,
			args: [lessonId]
		});

		if (quizResult.rows.length === 0) {
			return null; // No quiz for this lesson
		}

		const quizId = (quizResult.rows[0] as any).id;

		// Now get the best score for this quiz
		return await getUserBestScore(userId, quizId);
	} catch (error) {
		console.error('Error getting user best score by lesson ID:', error);
		return null;
	}
}

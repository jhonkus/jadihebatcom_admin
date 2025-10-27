<!-- src/routes/learning/[slug]/[lessonSlug]/quiz/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { AlertCircle, ArrowLeft, HelpCircle, Timer, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-svelte';

	export let data: PageData;

	$: course = data.course;
	$: lesson = data.lesson;
	$: quiz = data.quiz;
	$: error = data.error;
	$: canAttempt = data.canAttempt;
	$: bestScore = data.bestScore;

	// Quiz state
	let currentQuestionIndex = 0;
	let selectedAnswers: { [key: string]: string } = {};
	let quizCompleted = false;
	let score = 0;
	let showResults = false;
	let timeRemaining = 0; // Will be set when quiz loads
	let timerActive = false;
	let attemptId: number | null = null;
	let quizStartTime: number = 0;

	// Timer logic
	let timerInterval: ReturnType<typeof setInterval>;
	let timerStarted = false; // Prevent multiple timer starts

	// Quiz attempt tracking
	async function startQuizAttempt() {
		if (!quiz) return;

		try {
			const response = await fetch('/api/quiz/attempt/start', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					quizId: parseInt(quiz.id.replace('quiz-', ''))
				})
			});

			const result = await response.json();
			if (result.attemptId) {
				attemptId = result.attemptId;
				quizStartTime = Date.now();
			}
		} catch (error) {
			console.error('Error starting quiz attempt:', error);
		}
	}

	async function submitQuizAnswers() {
		if (!attemptId || !quiz?.questions) return;

		const answers = quiz.questions.map((question) => {
			const selectedAnswer = selectedAnswers[question.id];
			let selectedOptionId = null;

			if (selectedAnswer) {
				// Find the option ID from the selected answer
				const option = question.options.find((opt) => opt.value === selectedAnswer);
				if (option) {
					selectedOptionId = parseInt(option.id.replace('opt', ''));
				}
			}

			return {
				questionId: parseInt(question.id.replace('q', '')),
				selectedOptionId,
				answerText: null
			};
		});

		try {
			await fetch('/api/quiz/attempt/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					attemptId,
					answers
				})
			});
		} catch (error) {
			console.error('Error submitting quiz answers:', error);
		}
	}

	async function completeQuizAttempt(finalScore: number) {
		if (!attemptId) return;

		const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000); // in seconds

		try {
			await fetch('/api/quiz/attempt/complete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					attemptId,
					score: finalScore,
					timeTaken
				})
			});
		} catch (error) {
			console.error('Error completing quiz attempt:', error);
		}
	}

	function startTimer() {
		timerActive = true;
		timerInterval = setInterval(() => {
			if (timeRemaining > 0) {
				timeRemaining--;
			} else {
				// Time's up - auto submit
				clearInterval(timerInterval);
				submitQuiz();
			}
		}, 1000);
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function selectAnswer(questionId: string, answer: string) {
		selectedAnswers[questionId] = answer;

		// Start quiz attempt when user first selects an answer
		if (!attemptId) {
			startQuizAttempt();
		}
	}

	function nextQuestion() {
		if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
			currentQuestionIndex++;
		}
	}

	function previousQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	}

	async function submitQuiz() {
		if (!quiz?.questions) return;

		clearInterval(timerInterval);
		timerActive = false;

		// Calculate score
		let correctAnswers = 0;
		quiz.questions.forEach((question) => {
			if (selectedAnswers[question.id] === question.correctAnswer) {
				correctAnswers++;
			}
		});

		score = Math.round((correctAnswers / quiz.questions.length) * 100);
		quizCompleted = true;

		// Submit answers to database
		await submitQuizAnswers();

		// Complete the attempt
		await completeQuizAttempt(score);

		showResults = true;
	}

	function restartQuiz() {
		currentQuestionIndex = 0;
		selectedAnswers = {};
		quizCompleted = false;
		showResults = false;
		score = 0;
		timeRemaining = quiz?.timeLimit ? quiz.timeLimit * 60 : 0;
		timerActive = false;
		timerStarted = false;
		attemptId = null;
		quizStartTime = 0;
		clearInterval(timerInterval);
	}

	function goBackToLesson() {
		// Navigate back to the course learning page with the specific lesson selected
		if (course && lesson) {
			// Removed broken link to /learning/${course.slug}?lesson=${lesson.slug}
		} else if (course) {
			// Removed broken link to /learning/${course.slug}
		} else {
			// Fallback to my courses if course is not available
			// Removed broken link to /my-courses
		}
	}

	// Initialize timer when quiz loads
	$: if (quiz && !timerStarted && !quizCompleted) {
		timeRemaining = quiz.timeLimit * 60; // Set initial time
		startTimer();
		timerStarted = true;
		// Don't start attempt here - wait for user interaction
	}

	// Cleanup timer on destroy
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		// Timer will be initialized by reactive statement above
	});

	onDestroy(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});

	$: currentQuestion = quiz?.questions?.[currentQuestionIndex];
	$: progressPercentage = quiz?.questions
		? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
		: 0;
	$: allQuestionsAnswered = quiz?.questions?.every((q) => selectedAnswers[q.id]);
</script>

<svelte:head>
	<title>{quiz?.title || 'Kuis'} | {course?.title || ''}</title>
</svelte:head>

{#if error}
	<div class="error-screen">
		<div class="container">
			<div class="error-content">
				<AlertCircle class="error-icon" size="80" aria-hidden="true" />
				<h3 class="mb-3">Oops! Terjadi Kesalahan</h3>
				<p class="text-muted mb-4">{error}</p>
				{#if bestScore}
					<div class="best-score-display mb-4">
						<h5 class="mb-3">Skor Terbaik Anda</h5>
						<div class="score-circle {bestScore.passed ? 'passed' : 'failed'}">
							<span class="score-number">{bestScore.score}</span>
							<span class="score-label">%</span>
						</div>
						<p class="mt-3 text-muted">
							Status: <strong class={bestScore.passed ? 'text-success' : 'text-danger'}>
								{bestScore.passed ? 'Lulus' : 'Belum Lulus'}
							</strong>
						</p>
					</div>
				{/if}
				<button class="btn btn-primary" onclick={goBackToLesson}>
					<ArrowLeft class="me-2" size="18" aria-hidden="true" />
					Kembali ke Lesson
				</button>
			</div>
		</div>
	</div>
{:else if !canAttempt && bestScore}
	<div class="max-attempts-screen">
		<div class="container">
			<div class="max-attempts-content">
				<HelpCircle class="max-attempts-icon" size="80" aria-hidden="true" />
				<h3 class="mb-3">Batas Percobaan Tercapai</h3>
				<p class="text-muted mb-4">
					Anda telah mencapai batas maksimal 2 kali percobaan untuk kuis ini.
				</p>

				<div class="best-score-display">
					<h5 class="mb-3">Skor Terbaik Anda</h5>
					<div class="score-circle {bestScore.passed ? 'passed' : 'failed'}">
						<span class="score-number">{bestScore.score}</span>
						<span class="score-label">%</span>
					</div>
					<p class="mt-3 text-muted">
						Status: <strong class={bestScore.passed ? 'text-success' : 'text-danger'}>
							{bestScore.passed ? 'Lulus' : 'Belum Lulus'}
						</strong>
					</p>
				</div>

				<div class="mt-4">
					<button class="btn btn-primary" onclick={goBackToLesson}>
						<ArrowLeft class="me-2" size="18" aria-hidden="true" />
						Kembali ke Lesson
					</button>
				</div>
			</div>
		</div>
	</div>
{:else if quiz && !showResults}
	<div class="quiz-page">
		<!-- Header -->
		<div class="quiz-header">
			<div class="container">
				<div class="d-flex align-items-center justify-content-between">
					<div>
						<h1 class="quiz-title">{quiz.title}</h1>
						<p class="quiz-description text-muted mb-0">{quiz.description}</p>
					</div>
				<div class="d-flex align-items-center gap-3">
					{#if timerActive}
						<div class="timer-badge">
							<Timer class="me-2" size="18" aria-hidden="true" />
							<span class="timer-text">{formatTime(timeRemaining)}</span>
						</div>
					{/if}
					<button class="btn btn-outline-secondary" onclick={goBackToLesson}>
						<ArrowLeft class="me-2" size="18" aria-hidden="true" />
						Kembali
					</button>
				</div>
				</div>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="progress-container">
			<div class="container">
				<div class="progress-info">
					<span>Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}</span>
					<span>{Math.round(progressPercentage)}% selesai</span>
				</div>
				<div class="progress">
					<div
						class="progress-bar bg-primary"
						role="progressbar"
						style="width: {progressPercentage}%"
						aria-valuenow={progressPercentage}
						aria-valuemin="0"
						aria-valuemax="100"
					></div>
				</div>
			</div>
		</div>

		<!-- Quiz Content -->
		<div class="quiz-content">
			<div class="container">
				{#if currentQuestion}
					<div class="question-card">
						<div class="question-header">
							<h3 class="question-title">
								<span class="question-number">{currentQuestionIndex + 1}.</span>
								{currentQuestion.question}
							</h3>
						</div>

						<div class="options-grid">
							{#each currentQuestion.options as option}
								<button
									class="option-btn {selectedAnswers[currentQuestion.id] === option.value
										? 'selected'
										: ''}"
									onclick={() => selectAnswer(currentQuestion.id, option.value)}
								>
								<span class="option-letter">{option.id.toUpperCase()}</span>
								<span class="option-text">{option.text}</span>
								{#if selectedAnswers[currentQuestion.id] === option.value}
									<CheckCircle class="check-icon" size="20" aria-hidden="true" />
								{/if}
							</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Navigation -->
				<div class="quiz-navigation">
					<button
						class="btn btn-outline-primary"
						disabled={currentQuestionIndex === 0}
						onclick={previousQuestion}
					>
						<ArrowLeft size="20" class="me-2" aria-hidden="true" />
						Sebelumnya
					</button>

					{#if currentQuestionIndex < quiz.questions.length - 1}
						<button
							class="btn btn-primary"
							disabled={!selectedAnswers[currentQuestion?.id || '']}
							onclick={nextQuestion}
						>
							Selanjutnya
							<ArrowRight size="20" class="ms-2" aria-hidden="true" />
						</button>
					{:else}
						<button class="btn btn-success" disabled={!allQuestionsAnswered} onclick={submitQuiz}>
							<CheckCircle size="20" class="me-2" aria-hidden="true" />
							Selesai Kuis
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else if showResults}
	<div class="results-page">
		<div class="results-overlay"></div>
		<div class="results-dialog">
			<div class="results-card">
				<div class="results-header">
					<div class="results-icon {score >= (quiz?.passingScore || 70) ? 'success' : 'danger'}">
						{#if score >= (quiz?.passingScore || 70)}
							<CheckCircle size="64" aria-hidden="true" />
						{:else}
							<XCircle size="64" aria-hidden="true" />
						{/if}
					</div>
					<h2 class="results-title">
						{score >= (quiz?.passingScore || 70) ? 'Selamat! 🎉' : 'Coba Lagi'}
					</h2>
					<p class="results-subtitle">
						{score >= (quiz?.passingScore || 70)
							? 'Anda telah menyelesaikan kuis dengan baik!'
							: 'Anda perlu mempelajari materi lebih lanjut.'}
					</p>
				</div>

				<div class="score-display">
					<div class="score-circle {score >= (quiz?.passingScore || 70) ? 'passed' : 'failed'}">
						<span class="score-number">{score}</span>
						<span class="score-label">%</span>
					</div>
					<div class="score-info">
						<p class="mb-1">Nilai Anda: <strong>{score}%</strong></p>
						<p class="mb-0 text-muted">
							KKM: {quiz?.passingScore || 70}% • Waktu: {formatTime(
								(quiz?.timeLimit || 0) * 60 - timeRemaining
							)}
						</p>
					</div>
				</div>

				<div class="results-actions">
					<button class="btn btn-outline-primary" onclick={restartQuiz}>
						<RotateCcw size="20" class="me-2" aria-hidden="true" />
						Coba Lagi
					</button>
					<button class="btn btn-primary" onclick={goBackToLesson}>
						<ArrowLeft size="20" class="me-2" aria-hidden="true" />
						Kembali ke Lesson
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Error Screen */
	.error-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
	}

	.error-content {
		text-align: center;
		padding: 3rem;
		background: white;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
	}

	.error-icon {
		font-size: 80px;
		color: #dc3545;
		margin-bottom: 1.5rem;
	}

	/* Quiz Page */
	.quiz-page {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.quiz-header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 2rem 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.quiz-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 0.5rem;
	}

	.quiz-description {
		font-size: 1rem;
	}

	.timer-badge {
		display: flex;
		align-items: center;
		background: #fef3c7;
		color: #92400e;
		padding: 0.5rem 1rem;
		border-radius: 25px;
		font-weight: 600;
		border: 1px solid #fbbf24;
	}

	.timer-text {
		font-family: 'Courier New', monospace;
		font-size: 1.1rem;
	}

	/* Progress */
	.progress-container {
		background: white;
		padding: 1.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		color: #64748b;
		font-weight: 500;
	}

	.progress {
		height: 8px;
		border-radius: 4px;
		background: #e2e8f0;
	}

	.progress-bar {
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	/* Quiz Content */
	.quiz-content {
		padding: 3rem 0;
	}

	.question-card {
		background: white;
		border-radius: 16px;
		padding: 2.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		margin-bottom: 2rem;
	}

	.question-header {
		margin-bottom: 2rem;
	}

	.question-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a202c;
		line-height: 1.5;
	}

	.question-number {
		color: #3b82f6;
		font-weight: 700;
		margin-right: 0.5rem;
	}

	.options-grid {
		display: grid;
		gap: 1rem;
	}

	.option-btn {
		display: flex;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		text-align: left;
		transition: all 0.2s ease;
		cursor: pointer;
		font-size: 1rem;
	}

	.option-btn:hover {
		border-color: #3b82f6;
		background: #eff6ff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.option-btn.selected {
		border-color: #3b82f6;
		background: #eff6ff;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
	}

	.option-letter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #3b82f6;
		color: white;
		font-weight: 700;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.option-text {
		flex: 1;
		font-weight: 500;
		color: #374151;
	}

	.check-icon {
		color: #3b82f6;
		font-size: 24px;
		margin-left: 1rem;
	}

	/* Navigation */
	.quiz-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 0;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Results Page */
	.results-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		padding: 2rem 0;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
	}

	.results-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		z-index: 9998;
	}

	.results-dialog {
		position: relative;
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.results-card {
		background: white;
		border-radius: 20px;
		padding: 3rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		text-align: center;
		max-width: 500px;
		width: 100%;
		position: relative;
		z-index: 10000;
	}

	.results-header {
		margin-bottom: 2.5rem;
	}

	.results-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
		font-size: 40px;
	}

	.results-icon.success {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.results-icon.danger {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
	}

	.results-title {
		font-size: 2rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 0.5rem;
	}

	.results-subtitle {
		color: #64748b;
		font-size: 1.1rem;
	}

	.score-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 2.5rem;
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 16px;
	}

	.score-circle {
		position: relative;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.score-circle.passed {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.score-circle.failed {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
	}

	.score-number {
		font-size: 2rem;
		font-weight: 800;
	}

	.score-label {
		position: absolute;
		bottom: 10px;
		right: 10px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.score-info {
		text-align: left;
	}

	.results-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.quiz-header .d-flex {
			flex-direction: column;
			align-items: flex-start !important;
			gap: 1rem;
		}

		.question-card {
			padding: 1.5rem;
		}

		.quiz-navigation {
			flex-direction: column;
			gap: 1rem;
		}

		.quiz-navigation .btn {
			width: 100%;
		}

		.score-display {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.score-info {
			text-align: center;
		}

		.results-actions {
			flex-direction: column;
		}

		.results-actions .btn {
			width: 100%;
		}

		.results-dialog {
			padding: 1rem;
		}

		.results-actions .btn {
			width: 100%;
		}

		.results-dialog {
			padding: 1rem;
		}

		.results-card {
			padding: 2rem;
			max-width: 100%;
		}
	}

	/* Max Attempts Screen */
	.max-attempts-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem 1rem;
	}

	.max-attempts-content {
		background: white;
		border-radius: 16px;
		padding: 3rem 2rem;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		width: 100%;
	}

	.max-attempts-icon {
		font-size: 4rem;
		color: #667eea;
		margin-bottom: 1rem;
	}

	.best-score-display {
		background: #f8f9fa;
		border-radius: 12px;
		padding: 2rem;
		margin: 2rem 0;
	}

	.best-score-display h5 {
		color: #495057;
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.score-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		font-size: 2rem;
		font-weight: bold;
		position: relative;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.score-circle.passed {
		background: linear-gradient(135deg, #28a745, #20c997);
		color: white;
	}

	.score-circle.failed {
		background: linear-gradient(135deg, #dc3545, #fd7e14);
		color: white;
	}

	.score-number {
		font-size: 2.5rem;
		font-weight: 700;
	}

	.score-label {
		font-size: 1.2rem;
		margin-left: 0.2rem;
		opacity: 0.9;
	}

	.error-screen .best-score-display {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.error-screen .best-score-display h5 {
		color: white;
	}

	.error-screen .score-circle {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	}
</style>

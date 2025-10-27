<!-- src/lib/components/SignInForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ErrorMsg from './ErrorMsg.svelte';

	export let dummyUsers: Array<{ email: string; password: string }> = [];

	const dispatch = createEventDispatcher();

	// Form state
	let email = '';
	let password = '';
	let rememberMe = false;

	// Error state
	let errors = {
		email: '',
		password: ''
	};

	// Validation functions
	const validateEmail = (email: string) => {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!email) return 'Email is required';
		if (!emailRegex.test(email)) return 'Invalid email format';
		return '';
	};

	const validatePassword = (password: string) => {
		if (!password) return 'Password is required';
		if (password.length < 6) return 'Password must be at least 6 characters';
		return '';
	};

	const validateForm = () => {
		errors = {
			email: validateEmail(email),
			password: validatePassword(password)
		};
		return !errors.email && !errors.password;
	};

	const onSubmit = (e: Event) => {
		e.preventDefault();

		if (validateForm()) {
			const formData = { email, password, rememberMe };

			// Check against dummy data (for demo purposes)
			const userExists = dummyUsers.some(
				(user) => user.email === email && user.password === password
			);

			if (userExists) {
				dispatch('signinSuccess', formData);
				// Reset form
				email = '';
				password = '';
				rememberMe = false;
			} else {
				errors.email = 'Invalid email or password';
			}
		}
	};
</script>

<form onsubmit={onSubmit}>
	<!-- Email Field -->
	<div class="form-input-box mb-3">
		<div class="form-input-title">
			<label for="emailAddress" class="form-label">Email Address <span>*</span></label>
		</div>
		<div class="form-input">
			<input
				bind:value={email}
				id="emailAddress"
				type="email"
				placeholder="Email Address"
				class:is-invalid={errors.email}
				class="form-control"
			/>
			<ErrorMsg error={errors.email} />
		</div>
	</div>

	<!-- Password Field -->
	<div class="form-input-box mb-3">
		<div class="form-input-title">
			<label for="password" class="form-label">Password <span>*</span></label>
		</div>
		<div class="form-input">
			<input
				bind:value={password}
				id="password"
				type="password"
				placeholder="Your Password"
				autocomplete="current-password"
				class:is-invalid={errors.password}
				class="form-control"
			/>
			<ErrorMsg error={errors.password} />
		</div>
	</div>

	<!-- Remember Me & Forgot Password -->
	<div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
		<div class="form-check">
			<input bind:checked={rememberMe} id="rememberMe" type="checkbox" class="form-check-input" />
			<label for="rememberMe" class="form-check-label">Remember me</label>
		</div>
		<div class="sign-forgot">
			<a href="/forgot" class="text-decoration-none">Forgot Password?</a>
		</div>
	</div>

	<!-- Submit Button -->
	<div class="bd-sign-btn">
		<button type="submit" class="btn btn-primary w-100">Sign In</button>
	</div>
</form>

<script lang="ts">
	export let error: string = '';
</script>

{#if error}
	<div class="invalid-feedback d-block">
		{error}
	</div>
{/if}

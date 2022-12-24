<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { _ } from 'svelte-i18n';

	// Load data.
	export let data: PageData;

	let selectedId = -1;

	if (data.ids.length > 0) {
		selectedId = data.ids[0];
	}

	function handleSubmit() {
		goto(`/${selectedId}`);
	}
</script>

<div class="main-container">
	<h1>{$_('Choose an ID')}</h1>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="select is-primary">
			<select bind:value={selectedId}>
				{#each data.ids as id}
					<option value={id}>
						{id}
					</option>
				{/each}
			</select>
		</div>

		<button class="button is-primary" disabled={selectedId == -1} type="submit">
			{$_('Submit')}
		</button>

		{#if data.err}
			<p class="mt-3">
				Error: {data.err}
			</p>
		{/if}
	</form>
</div>

<style>
	h1 {
		font-size: 3rem;
		text-align: center;
	}

	.main-container {
		margin: 30vh auto;
	}

	form {
		text-align: center;
		margin-top: 2em;
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { _ } from 'svelte-i18n';

	// Load data.
	export let data: PageData;

	let ids: number[] = [];
	let err = '';
	let selectedId = -1;

	async function processIds() {
		if (data.response.status != 200) {
			err = await data.response.text();
		}

		ids = await data.response.json();

		if (ids.length > 0) {
			selectedId = ids[0];
		}
	}

	onMount(() => {
		processIds();
	});

	function handleSubmit() {
		goto(`/${selectedId}`);
	}
</script>

<div class="main-container">
	<h1>{$_('Choose an ID')}</h1>

	<form on:submit|preventDefault={handleSubmit}>
		<select class="select select-primary" bind:value={selectedId}>
			{#each ids as id}
				<option value={id}>
					{id}
				</option>
			{/each}
		</select>

		<button class="btn btn-primary" disabled={selectedId == -1} type="submit">
			{$_('Submit')}
		</button>
	</form>

	{#if err}
		<p>
			Error: {err}
		</p>
	{/if}
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

<script lang="ts">
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	// Load data.
	export let data: PageData;

	let ids: number[] = []
	let err = ""
	let selectedId = -1;

	async function processIds() {
		if (data.response.status != 200) {
			err = await data.response.text();
		}

		ids = await data.response.json();

		if (ids.length > 0) {
			selectedId = ids[0]
		}
	}

	onMount(() => {
		processIds();
	});

	function handleSubmit() {
		goto(`/${selectedId}`)
	}
</script>


<div class="main-container">
	<!-- TODO: i18n -->
	<h1>Choose a tag</h1>

	<form on:submit|preventDefault={handleSubmit}>
		<select bind:value={selectedId}>
			{#each ids as id}
				<option value={id}>
					{id}
				</option>
			{/each}
		</select>
	
		<button disabled={selectedId == -1} type=submit>
			Submit
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
		width: min(100% - 3rem, 48rem);
		height: 50vh;
		margin: 4.5rem auto;
	}
</style>
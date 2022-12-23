<script lang="ts">
	import type { ResponseData } from '$lib/types';
	import Chart from './Chart.svelte';
	import { onMount } from 'svelte';
	import thermometerIcon from '$lib/images/thermometer.png';
	import dropletIcon from '$lib/images/droplet.png';
	import type { PageData } from './$types';

	// Load data.
	export let data: PageData;

	const refreshPeriodSeconds = 60;

	let apiData: ResponseData = {
		temperature: [],
		humidity: []
	};
	let err = '';

	async function fetchData() {
		try {
			const response = await fetch(`/api/data/${data.id}`);

			// TODO: get error message before converting to json as it can fail.
			const jsonResponse = await response.json();

			if (response.status != 200) {
				err = jsonResponse.message ?? 'no error message';

				return;
			}

			apiData = jsonResponse;
			err = '';
		} catch (error) {
			err = `Failed to fetch data from API: ${error}`;

			return;
		}

		if (err) {
			console.log(err);
		}
	}

	// First data fetch.
	onMount(() => {
		fetchData();
	});

	// Update the graph every refreshPeriodSeconds.
	let clear: NodeJS.Timer;
	$: {
		clearInterval(clear);
		clear = setInterval(fetchData, refreshPeriodSeconds * 1000);
	}

	let currentTemp = 0;

	$: if (apiData.temperature.length > 0) {
		currentTemp = apiData.temperature[apiData.temperature.length - 1].value;
	}

	let currentHumidity = 0;

	$: if (apiData.humidity.length > 0) {
		currentHumidity = apiData.humidity[apiData.humidity.length - 1].value;
	}
</script>

<div class="main-container">
	<h1 class="mb-5">
		<img class="emoji" src={thermometerIcon} alt="" />
		{currentTemp.toFixed(1)} °C
		<br class="mobile-break" />
		<img class="emoji ml-10" src={dropletIcon} alt="" />
		{currentHumidity.toFixed(1)} %
	</h1>

	<Chart data={apiData} />

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

	.emoji {
		display: inline;
		vertical-align: middle;
	}

	@media screen and (min-width: 600px) {
		.mobile-break {
			display: none;
		}
	}
</style>

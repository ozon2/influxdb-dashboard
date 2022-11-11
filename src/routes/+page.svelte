<script lang="ts">
	import type { InfluxDBPoint, ResponseData } from '$lib/types';
	import Chart from './Chart.svelte';
	import '@fontsource/roboto';
	import { onMount } from 'svelte';

	const refreshPeriodSeconds = 60;

	let data: ResponseData = {
		temperature: [],
		humidity: []
	};
	let err = '';

	async function fetchData() {
		try {
			const response = await fetch('/api/data');
			const jsonResponse = await response.json();

			if (response.status != 200) {
				err = jsonResponse.message ?? 'no error message';

				return;
			}

			data = jsonResponse;
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

	$: if (data.temperature.length > 0) {
		currentTemp = data.temperature[data.temperature.length - 1].value;
	}

	let currentHumidity = 0;

	$: if (data.humidity.length > 0) {
		currentHumidity = data.humidity[data.humidity.length - 1].value;
	}
</script>

<div class="main-container">
	<h1>
		🌡️ {currentTemp.toFixed(1)} °C <br class="mobile-break" />💧 {currentHumidity.toFixed(1)} %
	</h1>

	<Chart {data} />

	{#if err}
		<p>
			Error: {err}
		</p>
	{/if}
</div>

<style>
	:global(body) {
		background-color: #121212;
		color: #ffffff;
		font-family: 'Roboto';
	}

	h1 {
		color: var(--colour-dark);
		font-size: 3rem;
		text-align: center;
	}

	.main-container {
		width: min(100% - 3rem, 48rem);
		height: 50vh;
		margin: 4.5rem auto;
	}

	@media screen and (min-width: 600px) {
		.mobile-break {
			display: none;
		}
	}
</style>

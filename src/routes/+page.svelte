<script lang="ts">
	import type { InfluxDBPoint } from '$lib/types';
	import Chart from './Chart.svelte';
	import '@fontsource/roboto';

	const refreshPeriodSeconds = 60;

	let data: { temperature: InfluxDBPoint[]; humidity: InfluxDBPoint[] } = {
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
		} catch (error) {
			const message = `Failed to fetch data from API: ${err}`;
			console.log(message);

			err = message;

			return;
		}
	}

	// First data fetch.
	fetchData();

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

<main class="main-container">
	<h1>🌡️ {currentTemp.toFixed(1)} °C 💧 {currentHumidity.toFixed(1)} %</h1>

	<!-- TODO: One graph with both lines so it can be displayed on a tablet -->
	<Chart points={data.temperature} title="Température" unit="°C" />
	<Chart points={data.humidity} title="Humidité" unit="%" />

	{#if err}
		<p>
			Error: {err}
		</p>
	{/if}
</main>

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
		margin: 4.5rem auto;
	}
</style>

<script lang="ts">
	import type { ResponseData } from '$lib/types';
	import Chart from './Chart.svelte';
	import { onMount } from 'svelte';
	import thermometerIcon from '$lib/images/thermometer.png';
	import dropletIcon from '$lib/images/droplet.png';

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
		<img src={thermometerIcon} alt="" style="vertical-align:middle" />
		{currentTemp.toFixed(1)} °C
		<br class="mobile-break" />
		<img src={dropletIcon} alt="" style="vertical-align:middle; margin-left: 1em" />
		{currentHumidity.toFixed(1)} %
	</h1>

	<Chart {data} />

	{#if err}
		<p>
			Error: {err}
		</p>
	{/if}
</div>

<style>
	/* Use Roboto font. */
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	:global(body) {
		background-color: #121212;
		color: #ffffff;
		font-family: 'Roboto', sans-serif;
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

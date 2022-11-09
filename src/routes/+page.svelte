<script lang="ts">
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
import { onMount } from 'svelte';

Chart.register(...registerables);

let barChartElement: HTMLCanvasElement;

onMount(() => {
	new Chart(barChartElement, {
		type: 'line',
		data: {
			datasets: [{
				data: [{
					x: '2021-11-06 23:39:30',
					y: 50
				}, {
					x: '2021-11-07 01:00:28',
					y: 60
				}, {
					x: '2021-11-07 09:00:28',
					y: 20
				}]
        	}],
		},
		options: {
			scales: {
				x: {
					type: 'time',
				}
			}
    	}
	})
})

let data = 0;
let err = "";

async function fetchData() {
	try {
		const response = await fetch('/api/data');
		const jsonResponse = await response.json()

		if (response.status != 200) {
			err = jsonResponse.message ?? "else"

			return
		}

		data = jsonResponse
	} catch (error) {
		const message = `Failed to fetch data from API: ${err}`;
		console.log(message);

		err = message;
		
		return
	}
}
</script>

<main class="main-container">
	<h1>Home dashboard</h1>

	<button on:click={fetchData}>Refresh</button>

	<section>
		<canvas bind:this={barChartElement} />
	</section>

	<p>
		Data: {data}
	</p>

	<p>
		Error: {err}
	</p>
</main>

<style>
	h1 {
	  color: var(--colour-dark);
	  font-size: 3rem;
	}

	.main-container {
	  width: min(100% - 3rem, 48rem);
	  margin: 4.5rem auto;
	}
</style>
  
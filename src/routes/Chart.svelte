<script lang="ts">
	import type { InfluxDBPoint } from '$lib/types';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-moment';
	import { onMount } from 'svelte';

	export let points: InfluxDBPoint[];
	export let title: string;
	export let unit: string;

	let chartElement: HTMLCanvasElement;
	let chart: Chart<'line', InfluxDBPoint[], string>;

	$: if (chart) {
		chart.data.datasets[0].data = points;
		chart.update();
	}

	// Chart text color.
	Chart.defaults.color = '#ffffff';

	onMount(() => {
		chart = new Chart(chartElement, {
			type: 'line',
			data: {
				datasets: [
					{
						data: points,
						showLine: true,
						// Line color,
						borderColor: '#bb86fc',
						// Hide points.
						pointRadius: 0
					}
				]
			},
			options: {
				scales: {
					x: {
						type: 'time',
						time: {
							displayFormats: { hour: 'HH:mm' }
						},
						grid: {
							color: '#ffffff'
						}
					},
					y: {
						grid: {
							color: '#ffffff'
						},
						title: {
							display: true,
							text: `${title} (${unit})`
						}
					}
				},
				parsing: {
					xAxisKey: 'time',
					yAxisKey: 'value'
				},
				plugins: {
					title: {
						display: true,
						text: title
					},
					legend: {
						display: false
					}
				}
			}
		});
	});
</script>

<canvas bind:this={chartElement} />

<style>
	canvas {
		margin: 1em;
	}
</style>

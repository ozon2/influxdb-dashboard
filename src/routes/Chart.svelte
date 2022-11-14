<script lang="ts">
	import type { InfluxDBPoint, ResponseData } from '$lib/types';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-moment';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let data: ResponseData;

	let chartElement: HTMLCanvasElement;
	let chart: Chart<'line', InfluxDBPoint[], string>;

	$: if (chart) {
		chart.data.datasets[0].data = data.temperature;
		chart.data.datasets[1].data = data.humidity;
		chart.update();
	}

	// Chart text color.
	Chart.defaults.color = '#ffffff';

	onMount(() => {
		// Show less ticks on the time axis on mobile devices.
		const maxTicksLimit = window.screen.width < 600 ? 6 : 12;

		chart = new Chart(chartElement, {
			type: 'line',
			data: {
				datasets: [
					{
						label: $_('temperature'),
						yAxisID: 'temperature',
						data: data.temperature,
						showLine: true,
						// Line color,
						borderColor: '#f03a17',
						// Hide points.
						pointRadius: 0,
						// Use Bezier curve for smoother lines.
						tension: 1
					},
					{
						label: $_('humidity'),
						yAxisID: 'humidity',
						data: data.humidity,
						showLine: true,
						// Line color,
						borderColor: '#00bcf2',
						// Hide points.
						pointRadius: 0,
						// Use Bezier curve for smoother lines.
						tension: 1
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
						},
						ticks: {
							maxTicksLimit: maxTicksLimit
						}
					},
					temperature: {
						position: 'left',
						grid: {
							color: '#ffffff'
						},
						title: {
							display: true,
							text: `${$_('temperature')} (°C)`
						}
					},
					humidity: {
						position: 'right',
						title: {
							display: true,
							text: `${$_('humidity')} (%)`
						}
					}
				},
				parsing: {
					xAxisKey: 'time',
					yAxisKey: 'value'
				},
				maintainAspectRatio: false
			}
		});
	});
</script>

<canvas bind:this={chartElement} />

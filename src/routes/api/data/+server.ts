import { json, error } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';
import type { InfluxDBPoint, InfluxDBRow } from '$lib/types';
import Papa from 'papaparse';
import {
	INFLUXDB_URL,
	INFLUXDB_ORG,
	INFLUXDB_USER,
	INFLUXDB_PASSWORD,
	INFLUXDB_BUCKET,
	INFLUXDB_TEMPERATURE_MEASUREMENT,
	INFLUXDB_HUMIDITY_MEASUREMENT
} from '$env/static/private';

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	const token = `${INFLUXDB_USER}:${INFLUXDB_PASSWORD}`;

	const fluxQuery = `from(bucket:"${INFLUXDB_BUCKET}") 
        |> range(start: -1d) 
        |> filter(fn: (r) => r._measurement == "${INFLUXDB_TEMPERATURE_MEASUREMENT}" or r._measurement == "${INFLUXDB_HUMIDITY_MEASUREMENT}")
        |> movingAverage(n: 60)`;

	return await fetch(`${INFLUXDB_URL}/api/v2/query?org=${INFLUXDB_ORG}`, {
		body: fluxQuery,
		headers: {
			Accept: 'application/csv',
			Authorization: `Token ${token}`,
			'Content-Type': 'application/vnd.flux'
		},
		method: 'POST'
	})
		.then((response) => {
			return response.text();
		})
		.then((csv) => {
			let temperature: InfluxDBPoint[] = [];
			let humidity: InfluxDBPoint[] = [];

			Papa.parse<InfluxDBRow>(csv, {
				complete: (results) => {
					for (const row of results.data) {
						if (!Array.isArray(row) || row.length !== 9) {
							continue;
						}

						const value = row[6];
						if (isNaN(Number(value))) {
							continue;
						}

						const time = row[5];

						const measurement = row[8];
						switch (measurement) {
							case INFLUXDB_TEMPERATURE_MEASUREMENT:
								temperature.push({
									time: time,
									value: parseFloat(value)
								});
								break;
							case INFLUXDB_HUMIDITY_MEASUREMENT:
								humidity.push({
									time: time,
									value: parseFloat(value)
								});
								break;
						}
					}
				}
			});

			return json({ temperature, humidity });
		})
		.catch((err) => {
			const message = `Failed to fetch data from InfluxDB: ${err}`;
			console.log(message);

			throw error(500, message);
		});
};

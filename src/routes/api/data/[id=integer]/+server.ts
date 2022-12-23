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
	INFLUXDB_MEASUREMENT,
	INFLUXDB_TEMPERATURE_FIELD,
	INFLUXDB_HUMIDITY_FIELD
} from '$env/static/private';

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	const token = `${INFLUXDB_USER}:${INFLUXDB_PASSWORD}`;

	// The "id" parameter is an integer so there is no possible injection.
	const fluxQuery = `from(bucket:"${INFLUXDB_BUCKET}") 
        |> range(start: -1d)
        |> filter(fn: (r) => r._measurement == "${INFLUXDB_MEASUREMENT}" and r.id == "${params.id}")
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
		.then((text) => {
			let temperature: InfluxDBPoint[] = [];
			let humidity: InfluxDBPoint[] = [];

			Papa.parse<InfluxDBRow>(text, {
				complete: (results) => {
					for (const row of results.data) {
						if (!Array.isArray(row) || row.length < 7) {
							continue;
						}

						const value = row[6];
						if (isNaN(Number(value))) {
							continue;
						}

						const time = row[5];
						const field = row[7];

						switch (field) {
							case INFLUXDB_TEMPERATURE_FIELD:
								temperature.push({
									time: time,
									value: parseFloat(value)
								});
								break;
							case INFLUXDB_HUMIDITY_FIELD:
								humidity.push({
									time: time,
									value: parseFloat(value)
								});
								break;
						}
					}
				}
			});

			// If the list is empty, there was probably an error.
			if (temperature.length == 0) {
				throw text
			}

			return json({ temperature, humidity });
		})
		.catch((err) => {
			const message = `Failed to fetch data from InfluxDB: ${err}`;
			console.log(message);

			throw error(500, message);
		});
};

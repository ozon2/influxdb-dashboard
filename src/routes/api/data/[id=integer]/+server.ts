import { json, error } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';
import type { InfluxDBPoint, InfluxDBRow } from '$lib/types';
import Papa from 'papaparse';
import {
	INFLUXDB_BUCKET,
	INFLUXDB_MEASUREMENT,
	INFLUXDB_TEMPERATURE_FIELD,
	INFLUXDB_HUMIDITY_FIELD
} from '$env/static/private';
import { Query } from '$lib/influxdb';

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	// The "id" parameter is an integer so there is no possible injection.
	const fluxQuery = `from(bucket:"${INFLUXDB_BUCKET}") 
        |> range(start: -1d)
        |> filter(fn: (r) => r._measurement == "${INFLUXDB_MEASUREMENT}" and r.id == "${params.id}")
        |> movingAverage(n: 60)`;

	const response = await Query(fluxQuery).catch((err) => {
		const message = `Failed to fetch data from InfluxDB: ${err}`;
		console.log(message);

		throw error(500, message);
	});

	const textResp = await response.text();

	if (response.status != 200) {
		const message = `Failed to fetch data from InfluxDB: ${textResp}`;
		console.log(message);

		throw error(500, message);
	}

	const temperature: InfluxDBPoint[] = [];
	const humidity: InfluxDBPoint[] = [];

	Papa.parse<InfluxDBRow>(textResp, {
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

	return json({ temperature, humidity });
};

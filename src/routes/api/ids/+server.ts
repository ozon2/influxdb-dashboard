import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { InfluxDBRow } from '$lib/types';
import Papa from 'papaparse';
import { INFLUXDB_BUCKET, INFLUXDB_MEASUREMENT } from '$env/static/private';
import { Query } from '$lib/influxdb';

// List available sensor id tags.
export const GET: RequestHandler = async () => {
	// The "id" parameter is an integer so there is no possible injection.
	const fluxQuery = `from(bucket:"${INFLUXDB_BUCKET}") 
        |> range(start: -5m)
        |> filter(fn: (r) => r._measurement == "${INFLUXDB_MEASUREMENT}")
        |> group(columns: ["id"])
        |> distinct(column: "id")`;

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

	const ids: number[] = [];

	Papa.parse<InfluxDBRow>(textResp, {
		complete: (results) => {
			for (const row of results.data) {
				if (!Array.isArray(row) || row.length < 7) {
					continue;
				}

				const id = parseFloat(row[6]);
				if (!id) {
					continue;
				}

				ids.push(id);
			}
		}
	});

	return json(ids);
};

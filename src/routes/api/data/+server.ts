import { json, error } from '@sveltejs/kit';
import moment from 'moment';
import type { RequestEvent, RequestHandler } from './$types';
import type { InfluxDBPoint, InfluxDBRow } from '$lib/types';
import Papa from 'papaparse';

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	const url = `${process.env.INFLUXDB_URL}`;
	const org = `${process.env.INFLUXDB_ORG}`;
	const token = `${process.env.INFLUXDB_USER}:${process.env.INFLUXDB_PASSWORD}`;

	const fluxQuery = `from(bucket:"db0") 
        |> range(start: -1d) 
        |> filter(fn: (r) => r._measurement == "temperature" or r._measurement == "humidity")
        |> movingAverage(n: 60)`;

	return await fetch(`${url}/api/v2/query?org=${org}`, {
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
			let dataPoints: { [time: string]: InfluxDBPoint } = {};

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

						const time = moment(row[5]);
						if (!time.isValid()) {
							continue;
						}

						const formattedTime = time.format('HH:mm');
						const measurement = row[8];
						switch (measurement) {
							case 'temperature':
								dataPoints[formattedTime] = {
									time: formattedTime,
									temperature: value,
									humidity: dataPoints[formattedTime]?.humidity ?? ''
								};
								break;
							case 'humidity':
								dataPoints[formattedTime] = {
									time: formattedTime,
									temperature: dataPoints[formattedTime]?.temperature ?? '',
									humidity: value
								};
								break;
						}
					}

					// Remove data points where we don't have both the temperature and humidity.
					for (const time in dataPoints) {
						if (!dataPoints[time].temperature || !dataPoints[time].humidity) {
							delete dataPoints[time];
						}
					}
				}
			});

			return json({ dataPoints });
		})
		.catch((err) => {
			const message = `Failed to fetch data from InfluxDB: ${err}`;
			console.log(message);

			throw error(500, message);
		});
};

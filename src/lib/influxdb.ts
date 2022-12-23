import { INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_USER, INFLUXDB_PASSWORD } from '$env/static/private';

// Execute a Flux query on the InfluxDB server.
export const Query = async (query: string) => {
	const token = `${INFLUXDB_USER}:${INFLUXDB_PASSWORD}`;

	return await fetch(`${INFLUXDB_URL}/api/v2/query?org=${INFLUXDB_ORG}`, {
		body: query,
		headers: {
			Accept: 'application/csv',
			Authorization: `Token ${token}`,
			'Content-Type': 'application/vnd.flux'
		},
		method: 'POST'
	});
};

export type InfluxDBPoint = {
	// Time with RFC3339 format.
	time: string;
	value: float;
};

export type InfluxDBRow = [
	datatype: string,
	result: string,
	table: string,
	start: string,
	stop: string,
	// Time with RFC3339 format.
	time: string,
	value: string,
	field: string,
	measurement: string
];

export type ResponseData = {
	temperature: InfluxDBPoint[];
	humidity: InfluxDBPoint[];
};

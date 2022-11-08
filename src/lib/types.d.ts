export interface InfluxDBPoint {
    temperature: string;
    humidity: string;
    time: string;
}

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
    measurement: string,
]

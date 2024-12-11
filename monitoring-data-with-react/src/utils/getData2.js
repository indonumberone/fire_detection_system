import { InfluxDB } from "@influxdata/influxdb-client";

const token = "tokenrahasia";
const org = "hfs";
const bucket = "mydatabase";
const url = "http://localhost:8086";

const influxDB = new InfluxDB({ url, token });

export async function getData2(time, startDate, endDate, field, _measurement) {
  const start = startDate ? startDate.toISOString() : "-30d";
  const end = endDate ? endDate.toISOString() : "now()";

  const query = `
    from(bucket: "${bucket}")
      |> range(start: ${start}, stop: ${end})
      |> filter(fn: (r) => r["_measurement"] == "${_measurement}")
      |> filter(fn: (r) => r["_field"] == "${field}")
      |> aggregateWindow(every: ${time}, fn: unique, createEmpty: false)
  `;

  console.log("Query yang dikirim ke InfluxDB:", query);
  const queryApi = influxDB.getQueryApi(org);

  try {
    const rows = await queryApi.collectRows(query);
    console.log("Data yang diterima:", rows);
    return rows;
  } catch (error) {
    console.error("Error saat menjalankan query:", error);
    return [];
  }
}

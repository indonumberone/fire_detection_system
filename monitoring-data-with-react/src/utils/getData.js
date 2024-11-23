import { InfluxDB } from "@influxdata/influxdb-client";
const token = "tokenrahasia";
const org = "hfs";
const bucket = "mydatabase";
const url = "http://192.168.122.1:8086";

const influxDB = new InfluxDB({ url, token });

export async function getData(time, range, field, _measurement) {
  const Range = range ? range : "1d";
  const query = `
    from(bucket: "${bucket}")
      |> range(start: -${Range})  
      |> filter(fn: (r) => r["_measurement"] == "${_measurement}")
      |> filter(fn: (r) => r["_field"] == "${field}")
      |> aggregateWindow(every: ${time}, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  const queryApi = influxDB.getQueryApi(org);

  try {
    const rows = await queryApi.collectRows(query);
    // console.log(rows);
    return rows;
  } catch (error) {
    console.error("Error saat menjalankan query:", error);
    return [];
  }
}

// console.log(await getData());

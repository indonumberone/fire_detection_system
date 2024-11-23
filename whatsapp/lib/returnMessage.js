export const returnMessage = async (
  sensor,
  system_status,
  risk,
  tempat,
  judul
) => {
  if (judul === "PASCA") {
    const pesane = `
┏━━ꕥ *「 Status Sensor di ${judul.toUpperCase()}」* ꕥ━⬣
┃> *temperature:* ${sensor.temperature}
┃> *humidity:* ${sensor.humidity}
┃> *gas:* ${sensor.gas}
┃> *flame:* ${sensor.flame}
┃> *status:* ${system_status.status}
┃> *risk_level:* ${system_status.risk_level}
┃> *detailed_status:* ${system_status.detailed_status}
┃> *temperature_risk:* ${risk.temperature_risk}
┃> *humidity_risk:* ${risk.humidity_risk}
┃> *gas_risk:* ${risk.gas_risk}
┃> *ruang:* ${tempat.ruang}
┃> *lantai:* ${tempat.lantai}
┗━━━━━━━━━━━━━━━━━━━ꕥ
              `;
    return pesane;
  } else {
    const pesane = `
┏━━ꕥ *「  PERINGATAN !!!  」* ꕥ━⬣
┃> *temperature:* ${sensor.temperature}
┃> *humidity:* ${sensor.humidity}
┃> *gas:* ${sensor.gas}
┃> *flame:* ${sensor.flame}
┃> *status:* ${system_status.status}
┃> *risk_level:* ${system_status.risk_level}
┃> *detailed_status:* ${system_status.detailed_status}
┃> *temperature_risk:* ${risk.temperature_risk}
┃> *humidity_risk:* ${risk.humidity_risk}
┃> *gas_risk:* ${risk.gas_risk}
┃> *ruang:* ${tempat.ruang}
┃> *lantai:* ${tempat.lantai}
┗━━━━━━━━━━━━━━━━━━━ꕥ
              `;
    return pesane;
  }
};

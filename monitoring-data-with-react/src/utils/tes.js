// Membuat koneksi WebSocket ke server yang telah disediakan oleh Node-RED
const socket = new WebSocket("ws://192.168.0.107:1880/testing");

// Event listener untuk ketika koneksi berhasil dibuka
socket.onopen = function (event) {
  console.log("Koneksi WebSocket dibuka!");
};

// Event listener untuk menerima pesan
socket.onmessage = function (event) {
  // console.log("Pesan diterima: " + event.data);
  const receivedData = JSON.parse(event.data); // Parse JSON message if needed
  // alert("Pesan dari Node-RED: " + receivedData.message);
  console.log(receivedData);
};

// // Event listener untuk menangani error
// socket.onerror = function (event) {
//   console.error("Terjadi kesalahan WebSocket: ", event);
// };

// // Event listener untuk menangani penutupan koneksi
// socket.onclose = function (event) {
//   console.log("Koneksi WebSocket ditutup");
// };

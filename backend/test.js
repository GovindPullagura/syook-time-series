const io = require("socket.io-client");

const socket = io("http://localhost:3000"); // Replace with the emitter's server URL

socket.on("connect", () => {
  console.log("Connected to emitter");
});

socket.on("dataStream", (dataStream) => {
  console.log("Received data stream:");
  console.log(dataStream);
});

socket.on("disconnect", () => {
  console.log("Disconnected from emitter");
});

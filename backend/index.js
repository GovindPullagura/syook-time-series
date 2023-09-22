const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { emitDataStream } = require("./emitter");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Pass the io object to the emitDataStream function
emitDataStream(io);

io.on("connection", (socket) => {
  console.log("Emitter connected");
  //   emitDataStream(io);

  socket.on("disconnect", () => {
    console.log("Emitter disconnected");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Emitter service listening on port ${port}`);
});

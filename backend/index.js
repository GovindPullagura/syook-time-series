const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { emitDataStream } = require("./emitter");
const { processDataStream } = require("./listener");
const { dataRouter } = require("./routes/dataRoute");
const { connection } = require("./db");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use("/data", dataRouter);

// Pass the io object to the emitDataStream function
emitDataStream(io);

io.on("connection", (socket) => {
  console.log("Emitter connected");

  socket.on("disconnect", () => {
    console.log("Emitter disconnected");
  });
});

//  Listener functionality
io.on("connection", (socket) => {
  console.log("Listener connected");

  // Handle dataStream events from connected clients
  socket.on("dataStream", (dataStream) => {
    processDataStream(io, dataStream);
  });

  socket.on("disconnect", () => {
    console.log("Listener disconnected");
  });
});

const port = process.env.PORT || 3001;
server.listen(port, async () => {
  console.log(`Emitter service listening on port ${port}`);
  try {
    await connection;
    console.log("Connected to the database");
  } catch (error) {
    console.log(error.message);
  }
});

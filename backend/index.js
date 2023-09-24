const crypto = require("crypto");
const MongoClient = require("mongodb").MongoClient;
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Add the 'cors' package
const { emitterFunction } = require("./emitter");
const express = require("express");
require("dotenv").config();

const app = express();

// Initialize the HTTP server
const server = http.createServer(app);

// Add CORS configuration to Socket.IO
// const io = socketIO(server, {
//   cors: {
//     origin: "http://localhost:3000", // Replace with your React app's URL
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Listener server is listening on port ${PORT}`);
});
const io = new Server(server);

// MongoDB connection URL
const mongoUrl = process.env.mongoURL;
// Function to handle MongoDB connection
async function connectToMongo() {
  try {
    const client = await MongoClient.connect(mongoUrl);
    const db = client.db("syookTimeSeries");
    const collection = db.collection("objects");
    return collection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Function to save data to MongoDB
async function saveToMongo(collection, data) {
  try {
    const result = await collection.insertOne(data);
    // console.log("Data saved to MongoDB:", data);
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
  }
}

// Function to decrypt and process a single message
function processMessage(encryptedMessage, encryptionKey, collection) {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(encryptionKey, "hex"),
    Buffer.from("00000000000000000000000000000000", "hex")
  );

  let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf-8");
  decryptedMessage += decipher.final("utf-8");

  try {
    const message = JSON.parse(decryptedMessage);
    // console.log("Received message:", message);

    // Validate data integrity using the secret_key
    const secret_key = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          name: message.name,
          origin: message.origin,
          destination: message.destination,
        })
      )
      .digest("hex");

    if (secret_key === message.secret_key) {
      // Data integrity is valid, add a timestamp and save to MongoDB
      const timestamp = new Date();
      message.timestamp = timestamp;
      saveToMongo(collection, message);

      //   Emitting the decrypted data:
      return message;
    } else {
      console.warn("Data integrity check failed. Message discarded.");
    }
  } catch (error) {
    console.error("Error parsing or processing message:", error);
  }
}

// Handle incoming socket connections
io.on("connection", (socket) => {
  // console.log("Listener connected to emitter");

  // MongoDB connection is established when a socket connects
  connectToMongo()
    .then((collection) => {
      // Handle incoming messages
      socket.on("message", (messageData) => {
        // Split the concatenated messages using "|" as the separator
        const encryptedMessages = messageData.data.split("|");

        // Decrypt and process each encrypted message
        encryptedMessages.forEach((encryptedMessage) => {
          const { encryptionKey } = messageData;
          const msg = processMessage(
            encryptedMessage,
            encryptionKey,
            collection
          );
          // console.log("mnop");
          // console.log(msg);
          io.emit("data", msg);
        });
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
    });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("Listener disconnected from emitter");
  });
});

setInterval(() => {
  emitterFunction();
}, 10000); // Emit a batch of messages every 10 seconds

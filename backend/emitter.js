const crypto = require("crypto");
const io = require("socket.io-client");
const data = require("./data.json");

const serverUrl = "http://localhost:8080"; // Replace with your listener server URL
const socket = io(serverUrl);

const names = data.names;
const cities = data.cities;

function generateRandomMessage() {
  const name = names[Math.floor(Math.random() * names.length)];
  const origin = cities[Math.floor(Math.random() * cities.length)];
  const destination = cities[Math.floor(Math.random() * cities.length)];

  const originalMessage = {
    name,
    origin,
    destination,
  };

  // Create a secret_key by creating a sha-256 hash of the originalMessage
  const secret_key = crypto
    .createHash("sha256")
    .update(JSON.stringify(originalMessage))
    .digest("hex");

  return {
    ...originalMessage,
    secret_key,
  };
}

function encryptMessage(message, encryptionKey) {
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    encryptionKey,
    Buffer.from("00000000000000000000000000000000", "hex")
  );

  let encryptedMessage = cipher.update(JSON.stringify(message), "utf-8", "hex");
  encryptedMessage += cipher.final("hex");

  return encryptedMessage;
}

socket.on("connect", () => {
  console.log("Emitter connected to the server.");
});

socket.on("disconnect", () => {
  console.log("Emitter disconnected from the server.");
});

const emitterFunction = () => {
  // Generate a random number of messages between 49 and 499
  const numberOfMessages = 3;
  //   const numberOfMessages = Math.floor(Math.random() * (499 - 49 + 1) + 49);
  const encryptedMessages = []; // Array to store individual encrypted messages
  let encryptionKey = crypto.randomBytes(32);

  for (let i = 0; i < numberOfMessages; i++) {
    const message = generateRandomMessage();

    const encryptedMessage = encryptMessage(message, encryptionKey);
    encryptedMessages.push(encryptedMessage); // Store the encrypted message
  }

  // Concatenate the encrypted messages with "|" as the separator
  const concatenatedMessages = encryptedMessages.join("|");

  console.log(concatenatedMessages);

  socket.emit("message", {
    data: concatenatedMessages,
    encryptionKey: encryptionKey.toString("hex"), // Use encryptionKey here
  });
};

// setInterval(() => {
//   emitterFunction();
// }, 10000); // Emit a batch of messages every 10 seconds

module.exports = { emitterFunction };

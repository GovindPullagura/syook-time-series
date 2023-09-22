const crypto = require("crypto");
const fs = require("fs");

// Load data.json with constant values
const data = JSON.parse(fs.readFileSync("data.json"));

// Function to generate a random message
function generateRandomMessage() {
  const randomIndex = Math.floor(Math.random() * data.length);
  const { name, origin, destination } = data[randomIndex];
  const message = {
    name,
    origin,
    destination,
    secret_key: crypto
      .createHash("sha256")
      .update(JSON.stringify({ name, origin, destination }))
      .digest("hex"),
  };
  return message;
}

// Function to encrypt a message
function encryptMessage(message) {
  const key = crypto.randomBytes(32); // 256-bit key
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const encryptedMessage = cipher.update(
    JSON.stringify(message),
    "utf8",
    "hex"
  );
  return `${encryptedMessage}|${key.toString("hex")}${iv.toString("hex")}`;
}

// Emit data stream over a socket every 10 seconds
function emitDataStream(io) {
  setInterval(() => {
    const numMessages = Math.floor(Math.random() * 451) + 49; // Randomize the number of messages
    const messages = [];
    for (let i = 0; i < numMessages; i++) {
      const message = generateRandomMessage();
      const encryptedMessage = encryptMessage(message);
      messages.push(encryptedMessage);
    }
    io.emit("dataStream", messages.join("|"));
  }, 10000); // Emit every 10 seconds
}

module.exports = { emitDataStream };
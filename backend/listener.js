const { DataModel } = require("./models/data.model");
const crypto = require("crypto");

// Function to process the data stream
function processDataStream(io, dataStream) {
  // Split the data stream into individual messages
  const messages = dataStream.split("|");

  messages.forEach((message) => {
    // Split the encrypted message into message and key/IV parts
    const [encryptedMessage, keyAndIV] = message.split("|");
    const [key, iv] = keyAndIV.match(/.{1,32}/g);

    // Decrypt the message using AES-256-CTR
    const decipher = crypto.createDecipheriv(
      "aes-256-ctr",
      Buffer.from(key, "hex"),
      Buffer.from(iv, "hex")
    );
    let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf8");
    decryptedMessage += decipher.final("utf8");

    try {
      const payload = JSON.parse(decryptedMessage);

      // Validate the object using the secret_key
      const { name, origin, destination, secret_key } = payload;
      const calculatedSecretKey = crypto
        .createHash("sha256")
        .update(JSON.stringify({ name, origin, destination }))
        .digest("hex");

      if (calculatedSecretKey === secret_key) {
        // Valid object; add a timestamp and save it to MongoDB
        const timestamp = new Date();
        const timeSeriesData = new DataModel({
          name,
          origin,
          destination,
          secret_key,
          timestamp,
        });

        // Save the data to MongoDB
        timeSeriesData.save((err) => {
          if (err) {
            console.error("Error saving data:", err);
          } else {
            io.emit("dataSaved", timeSeriesData);
            console.log("Data saved successfully.");
          }
        });
      } else {
        // Data integrity compromised; log an error
        console.error("Data integrity compromised. Skipping object.");
      }
    } catch (error) {
      // Error parsing JSON; log an error
      console.error("Error parsing JSON:", error);
    }
  });
}

module.exports = { processDataStream };

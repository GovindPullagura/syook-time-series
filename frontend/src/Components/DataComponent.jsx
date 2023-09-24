import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("https://timeseries.onrender.com/", {
  transports: ["websocket"],
});

const DataComponent = () => {
  const [backendData, setBackendData] = useState([]);

  socket.on("connect", () => {
    console.log("Connected to the server");
  });
  socket.on("data", (data) => {
    try {
      console.log(data);
      setBackendData((prevData) => [...prevData, data]);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from the server");
  });

  return (
    <div>
      <h2>Data Component</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {backendData.map((dataItem, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
            }}
          >
            <p style={{ fontWeight: "bold" }}>Name: {dataItem.name}</p>
            <p>Origin: {dataItem.origin}</p>
            <p>Destination: {dataItem.destination}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataComponent;

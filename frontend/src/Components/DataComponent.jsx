import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Connect to the server
const socket = io("http://localhost:3001");

const DataComponent = () => {
  const [realTimeData, setRealTimeData] = useState([]);

  useEffect(() => {
    socket.on("dataStream", (dataStream) => {
      console.log("Received dataStream event from server:");
      console.log(dataStream);

      setRealTimeData((prevData) => [...prevData, ...dataStream]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }, []);

  return (
    <div>
      <h1>Real-Time Data</h1>
      <ul>
        {realTimeData.map((dataItem, index) => (
          <li key={index}>{dataItem.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DataComponent;

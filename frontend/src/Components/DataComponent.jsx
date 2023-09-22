import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080/data", {
  transports: ["websocket"],
  upgrade: false,
  cors: {
    origin: "http://localhost:8080/data", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

const DataComponent = () => {
  const [realTimeData, setRealTimeData] = useState([]);
  // const socket = io("http://localhost:8080/data");

  useEffect(() => {
    socket.on("dataSaved", (newData) => {
      setRealTimeData((prevData) => [...prevData, newData]);
    });

    return () => {
      socket.off("dataSaved");
    };
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

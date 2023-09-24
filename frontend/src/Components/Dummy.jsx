import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Dummy = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Listen for incoming data
    socket.on("dataStream", (jsonData) => {
      const dataFromBackend = JSON.parse(jsonData);
      console.log(jsonData);
      setData(dataFromBackend);
    });

    return () => {
      // Cleanup the socket connection when the component unmounts
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h1>Time Series Data</h1>
      <div>
        {data.map((message, index) => (
          <div key={index}>
            <strong>Name:</strong> {message.name}
            <br />
            <strong>Origin:</strong> {message.origin}
            <br />
            <strong>Destination:</strong> {message.destination}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dummy;

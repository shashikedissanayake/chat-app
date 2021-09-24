const io = require("socket.io-client");

const socket = io("http://localhost:3001", {
  query: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxX2NsaWVudCIsImlhdCI6MTYzMjQ4NTE2NiwiZXhwIjoxNjMyNDg4NzY2fQ.U5aFKciD-cHdWCqXWdUfmhGbS5cI3r0yDdW48-MSklY",
  },
});
socket.on("connect", () => {
  console.log("connected");
  console.log(socket.id);
});

socket.on("connect_error", (err) => {
  console.log("error:" + err.message); // prints the message associated with the error
  return;
});

const io = require("socket.io-client");

const socket = io('http://localhost:3000');
socket.on('chat-message', data => {
    console.log(data)
})
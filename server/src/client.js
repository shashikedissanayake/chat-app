const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
    query: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxX2NsaWVudCIsImlhdCI6MTYzMjU3MzgwMCwiZXhwIjoxNjMyNTc3NDAwfQ.Re-QCFBAVP55S28N89y68HMB2_uAqHktRfNN-Iz9BTF',
    },
});
socket.on('connect', () => {
    console.log('connected');
    console.log(socket.id);
});

socket.on('connect_error', (err) => {
    console.log(`error:${err.message}`); // prints the message associated with the error
});

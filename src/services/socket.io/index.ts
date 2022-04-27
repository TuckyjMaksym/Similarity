import { io } from 'socket.io-client';

export const socket = io(`http://localhost:${process.env.SERVER_PORT}`);

socket.on('connect_error', (err) => {
    console.log('connection error', err);
});

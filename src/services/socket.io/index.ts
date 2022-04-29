import { io } from 'socket.io-client';

export const socket = io();

socket.on('connect_error', (err) => {
    console.log('connection error', err);
});

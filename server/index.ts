import express from 'express';
import { createServer } from 'http';
import { Server, ServerOptions } from 'socket.io';
import dotenv from 'dotenv';
import ShortId from 'shortid';
import JSONdb from 'simple-json-db';

import { events } from '../common/events';
import { TRoom, TUser} from './types';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../.env'});
}

const app = express();

app.use(express.static(__dirname + '/client'));
app.get('/', async (req, res) => {
    res.render('index');
});

const httpServer = createServer(app);
const ioConfig: Partial<ServerOptions> = {
    cors: {
        origin: `http://localhost:${process.env.CLIENT_PORT}`,
        methods: ['GET', 'POST'],
    },
};
const io = new Server(httpServer, ioConfig);
const db = new JSONdb('db.json');

const getUser = (id: string): TUser => db.get(id);
const setUser = (id: string, data: TUser) => db.set(id, data);
const getRoom = (id: string): TRoom => db.get(id);
const setRoom = (id: string, data: TRoom) => db.set(id, data);

io.on('connection', client => {
    let roomId = '';

    setUser(client.id, { username: "" })
    console.log(client.id, 'Connected', new Date().toLocaleTimeString())

    client.on(events.JOIN_ROOM, async (id: string) => {
        console.log(`User trying to join to room: "${id}"`, new Date().toLocaleTimeString());
        
        if (!db.has(id)) {
            console.log(`Room "${id}" doesn't exist`);
            return client.emit(events.ROOM_NOT_EXISTS);
        }
        await client.join(id);
        console.log(`Player 2 joined the room: "${id}"`, new Date().toLocaleTimeString());
        const roomData = getRoom(id);

        roomData.player2 = { id: client.id, lastWord: '', submittedWord: '' };
        setRoom(id, roomData);
        roomId = id;
        const roomUsers = {
            [roomData.player1.id]: getUser(roomData.player1.id),
            [roomData.player2.id]: getUser(roomData.player2.id),
        }

        client.emit(events.JOIN_ROOM_SUCCESS, id, roomUsers);
    });

    client.on(events.CREATE_ROOM, async () => {
        console.log(`User "${client.id}" trying to create new room`, new Date().toLocaleTimeString());
        const newRoomId = ShortId.generate();

        await client.join(newRoomId);
        console.log(`User created and joined the room: "${newRoomId}"`, new Date().toLocaleTimeString());
        setRoom(newRoomId, { player1: { id: client.id, lastWord: '', submittedWord: '' } });
        roomId = newRoomId
        client.emit(events.ROOM_CREATED, roomId);
    });

    client.on(events.SET_USERNAME, (username: string) => {
        const roomData = getRoom(roomId);
        const isPlayer2 = roomData.player2?.id === client.id;
        const otherPlayerId = isPlayer2 ? roomData.player2?.id : roomData.player1.id; 
        const isUsernameExists = otherPlayerId && db.has(otherPlayerId) && getUser(otherPlayerId).username === username;
        
        if (!isUsernameExists) {
            console.log('Username doesn\'t exist, adding new user with username:', username);
            const dbUser = getUser(client.id);
            
            dbUser.username = username;
            setUser(client.id, dbUser);
            
            io.sockets.to(roomId).emit(events.USER_JOINED, { id: client.id, username });
        } else {
            client.emit(events.USERNAME_EXIST);
        }
    });

    client.on(events.SUBMIT_WORD , (word: string) => {
        console.log('User submitting word:', word);
        const room = getRoom(roomId);
        const isPlayer2 = room.player2?.id === client.id;

        if (isPlayer2 && room.player2) {
            room.player2.submittedWord = word;
        } else if (!isPlayer2) {
            room.player1.submittedWord = word;
        }
        if (room.player1.submittedWord && room.player2?.submittedWord) {
            room.player1.lastWord = room.player1.submittedWord;
            room.player2.lastWord = room.player2.submittedWord;
            room.player1.submittedWord = '';
            room.player2.submittedWord = '';
            const words = {
                [room.player1.id]: room.player1.lastWord,
                [room.player2.id]: room.player2.lastWord
            }

            io.sockets.to(roomId).emit(events.REVEAL_WORDS, words);
        } else if (!room.player1.submittedWord || !room.player2?.submittedWord) {
            io.sockets.to(roomId).emit(events.WORD_SUBMITTED, client.id, word);
        }
        setRoom(roomId, room);
    });

    client.on(events.VICTORY, () => {
        const room = getRoom(roomId);

        room.player1 = { id: room.player1.id, lastWord: '', submittedWord: '' };
        room.player2 = { id: room.player2!.id, lastWord: '', submittedWord: '' };
    })

    client.on('disconnect', () => {
        console.log(client.id, 'Disconnected', new Date().toLocaleTimeString());
        // Remove user from db
        db.delete(client.id);

        if (db.has(roomId)) {
            const room = getRoom(roomId);
            const isPlayer2 = room.player2?.id === client.id;

            // If player 2, remove "player2" from room
            if (isPlayer2) {
                console.log('User is Player 2, removing him from lobby');
                const { player2, ...updatedRoom } = room;
                console.log("🚀 ~ file: index.ts ~ line 113 ~ client.on ~ updatedRoom", updatedRoom)

                setRoom(roomId, updatedRoom);
            } else if (!isPlayer2) {
                console.log('User is Player 1, removing him from lobby and setting Player 2 as Player 1');
                // If player 1, remove "player1" and set "player2" as "player1"
                const { player2, player1, ...roomData } = room;
                const updatedRoom = { ...roomData, player1: player2! };

                console.log("🚀 ~ file: index.ts ~ line 121 ~ client.on ~ updatedRoom", updatedRoom)
                setRoom(roomId, updatedRoom);
            }
            client.to(roomId).emit(events.USER_LEFT, client.id);
        }
    });
});

httpServer.listen(process.env.SERVER_PORT, () => {
    console.log('Listening on port:', process.env.SERVER_PORT);
});

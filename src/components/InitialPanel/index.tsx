import React, { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import Button from 'react-bootstrap/Button';

import { events } from '../../../common/events';
import { socket } from '../../services/socket.io';
import { sRoom, sApp } from '../../state';

export const InitialPanel = () => {
    const [roomId, setRoomId] = useState('');
    const [submittedRoomId, setSubmittedRoomId] = useState(false);
    const [app, setApp] = useRecoilState(sApp);
    const [error, setError] = useState('');
    const setRoom = useSetRecoilState(sRoom);

    const joinRoom = () => {
        socket.emit(events.JOIN_ROOM, roomId);
    }
    const submitUsername = () => {
        socket.emit(events.SET_USERNAME, app.tempUsername);
    }
    const createRoom = () => {
        socket.emit(events.CREATE_ROOM);
    }

    const usernameBlock = () => (
        <>
            <p className="mb-2">
                Enter your username
            </p>
            <input type="text" placeholder="Username" value={app.tempUsername} onChange={e => setApp({ ...app, tempUsername: e.target.value})} />
            <Button className="mt-2" onClick={submitUsername}>
                Submit
            </Button>
        </>
    );
    const roomIdBlock = () => (
        <>
            <p className="mb-2">
                Enter room ID
            </p>
            <input type="text" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
            <div className="d-flex flex-column align-items-center mt-2">
                <Button className="w-100" onClick={joinRoom}>
                    JOIN
                </Button>
                <p className="my-2">
                    -or-
                </p>
                <Button className="w-100 btn-success" onClick={createRoom}>
                    CREATE ROOM
                </Button>
            </div>
        </>
    );

    React.useEffect(() => {
        socket.on(events.JOIN_ROOM_SUCCESS, (id, users) => {
            console.log('Joined room successfully', id);
            setRoom(room => ({ ...room, id, users }));
            setSubmittedRoomId(true);
            setError('');
        });
        socket.on(events.ROOM_CREATED, (id) => {
            console.log('Created room successfully', id);
            setRoom(room => ({ ...room, id }));
            setSubmittedRoomId(true);
            setError('');
        });
        socket.on(events.ROOM_NOT_EXISTS, () => setError('Room doesn\'t exist'));

        return () => {
            socket.off(events.JOIN_ROOM_SUCCESS);
            socket.off(events.ROOM_CREATED);
            socket.off(events.ROOM_NOT_EXISTS);
        }
    })

    return (
        <div className='d-flex flex-column justify-content-center'>
            {!submittedRoomId ? roomIdBlock() : usernameBlock()}
            <div className="d-flex flex-column align-items-center mt-3">
                {error && (
                    <p className="error mt-3">{error}</p>
                )}
            </div>
        </div>
    )
}

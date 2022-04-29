import React from 'react';
import { events, predefinedEvents } from '../../common/events';
import { socket } from '../services/socket.io';
import { useRecoilState } from 'recoil';

// Components
import { InitialPanel } from './InitialPanel';
import { InfoPanel } from './InfoPanel';
import { Lobby } from './Lobby';

import { sApp, sRoom, sUser } from '../state';
import { TUser } from '../types/user';
import { VictoryModal } from './VictoryModal';

export function App() {
    const [, setApp] = useRecoilState(sApp);
    const [user, setUser] = useRecoilState(sUser);
    const [room, setRoom] = useRecoilState(sRoom);

    React.useEffect(() => {
        socket.on(predefinedEvents.CONNECT, () => {
            console.log(socket.id, 'successfully connected to server');
            setUser(u => ({ ...u, id: socket.id }));
        })
        socket.on(events.USER_JOINED, (joinedUser: TUser) => {
            console.log('USER JHOINED', joinedUser, socket.id);
            const { id, ...data } = joinedUser;
            
            setRoom((r) => {
                const updatedUsers = { ...r.users, [id!]: data };

                return { ...r, users: updatedUsers }
            });
            if (joinedUser.id === socket.id) {
                setUser(u => ({ ...u, username: joinedUser.username }));
                setApp(app => ({ ...app, tempUsername: '' }));
            }
        });
        socket.on(events.USER_LEFT, (id: string) => {
            console.log('USER LEFT', id);
            setRoom((r) => {
                const { [id]: _, ...updatedUsers } = r.users;

                return { ...r, users: updatedUsers }
            });
        });
    }, []);
    const isUserReady = user.id && user.username && room.id;

    return (
        <div className='vw-100 vh-100 d-flex flex-column justify-content-center align-items-center'>
            <VictoryModal />
            <InfoPanel />
            {!isUserReady ? <InitialPanel /> : <Lobby />}
        </div>
    )
}

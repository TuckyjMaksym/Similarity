// State variables starts with "s" prefix
import { atom } from 'recoil';
import { TRoom } from '../types/room';
import { TUser } from '../types/user';
import { TApp } from '../types/app';

export const sUser = atom<TUser>({
    key: 'User',
    default: {
        id: null,
        username: '',
        lastWord: '',
        submittedWord: '',
    }
});

export const sRoom = atom<TRoom>({
    key: 'Room',
    default: {
        id: null,
        users: {}
    }
});

export const sApp = atom<TApp>({
    key: 'App',
    default: {
        gameStatus: 'playing',
        victoryWord: '',
        tempUsername: '',
    }
});

import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { useRecoilState } from 'recoil';
import { events } from '../../../common/events';

import { socket } from '../../services/socket.io';
import { sApp } from '../../state';

export const VictoryModal = () => {
    const [app, setApp] = useRecoilState(sApp);

    const onHide = () => {
        socket.emit(events.VICTORY)
        setApp(app => ({ ...app, gameStatus: 'playing' }));
    };

    return (
        <Modal show={app.gameStatus === 'victory'} backdrop onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Congrats! You won!</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>You both thought of: "<b>{app.victoryWord}</b></p>
            </Modal.Body>
        </Modal>
    )
}

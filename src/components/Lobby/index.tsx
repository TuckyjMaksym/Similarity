import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import Button from 'react-bootstrap/Button';

import { socket } from '../../services/socket.io';

import { sApp, sRoom, sUser } from '../../state';
import { events } from '../../../common/events';
import { TRoom } from '../../types/room';
import { TWords } from '../../types/api';

import styles from './Lobby.module.css';

export const Lobby = () => {
	const setApp = useSetRecoilState(sApp);
	const [room, setRoom] = useRecoilState(sRoom);
	const user = useRecoilValue(sUser);

	const [input, setInput] = React.useState('');

	// Handlers
	const submitWord = () => socket.emit(events.SUBMIT_WORD, input);

	React.useEffect(() => {
		socket.on(events.WORD_SUBMITTED, (userId: string, word: string) => {
			console.log('word "', word, '" submitted by: ', userId);
			console.log('userId === socket.id', userId, socket.id)
			if (userId !== socket.id) {
				setRoom((r) => {
					const roomData: TRoom = JSON.parse(JSON.stringify(r));
					
					roomData.users[userId].submittedWord = word;
                    console.log("🚀 ~ file: index.tsx ~ line 33 ~ setRoom ~ roomData", roomData)
					return roomData;
				});
			} else if (userId === socket.id) {
				setRoom((r) => {
					const roomData: TRoom = JSON.parse(JSON.stringify(r));

					roomData.users[socket.id].submittedWord = word;

                    console.log("🚀 ~ file: index.tsx ~ line 43 ~ setRoom ~ roomData", roomData)
					return roomData;
				});
				setInput('');
			}
		});

		socket.on(events.REVEAL_WORDS, (words: TWords) => {
			console.log('revealing words', words);
			const usersIds = Object.keys(words);
			const firstWord = words[usersIds[0]];
			const secondWord = words[usersIds[1]];

			if (firstWord === secondWord) {
				setRoom((roomData) => {
					const updatedRoom: TRoom = JSON.parse(JSON.stringify(roomData));
					const usersIds = Object.keys(updatedRoom.users);
					console.log("🚀 ~ file: index.tsx ~ line 58 ~ socket.on ~BEFORE updatedRoom.users", updatedRoom.users)
			
					usersIds.forEach((userId) => {
						console.log("🚀 ~ file: index.tsx ~ line 61 ~ usersIds.forEach ~ userId", userId)
						updatedRoom.users[userId].lastWord = '';
						updatedRoom.users[userId].submittedWord = '';
						console.log("🚀 ~ file: index.tsx ~ line 64 ~ usersIds.forEach ~ updatedRoom.users[userId]", updatedRoom.users[userId])
					});
					console.log("🚀 ~ file: index.tsx ~ line 64 ~ socket.on ~ updatedRoom", updatedRoom.users)
					return updatedRoom;
				});
				setApp(app => ({ ...app, gameStatus: 'victory', victoryWord: firstWord }));
			} else if (firstWord !== secondWord) {
				setRoom((r) => {
					const roomData: TRoom = JSON.parse(JSON.stringify(r));
					
					usersIds.forEach((userId) => {
						roomData.users[userId].lastWord = words[userId];
						roomData.users[userId].submittedWord = '';
					});
					console.log("🚀 ~ file: index.tsx ~ line 46 ~ setRoom ~ roomData", roomData)
					return roomData;
				});
			}
			setInput('');
		});

		return () => {
			socket.off(events.WORD_SUBMITTED);
			socket.off(events.REVEAL_WORDS);
		}
	}, []);

	const usersIds = Object.keys(room.users);
	const isAloneInLobby = usersIds.length === 1 && usersIds[0] === user.id;

	if (isAloneInLobby) {
		return <p>Your friends can join using lobby ID: <b>"{room.id}"</b></p>
	}
	const teammateId = usersIds[0] === user.id ? usersIds[1] : usersIds[0];
	let teammateInput = '?';

	if (room.users?.[teammateId]?.submittedWord) {
		teammateInput = '✔';
	}
	return (
		<div className="col-12 d-flex flex-column">
			<div className={`col-12 d-flex ${styles.users}`}>
				<div className="col-6 d-flex flex-column align-items-center">
					<h3>
						ME
					</h3>
					<div className="mt-2 d-flex">
						{room.users[user.id!].submittedWord || input}
						<div className="align-self-end blink_underscore" />
					</div>
				</div>
				<div className="col-6 d-flex flex-column align-items-center">
					<h3>
						{room.users?.[teammateId]?.username}
					</h3>
					<div className="mt-2">
						{teammateInput}
					</div>
				</div>
			</div>
			<div className={`d-flex flex-column align-items-center align-self-center position-relative ${styles.input}`}>
				<input value={input} onChange={e => setInput(e.target.value)} />
				<p className="mt-2 position-absolute top-100">Enter word above</p>
				<Button className="position-absolute start-100 top-50 ms-4 px-4 py-2" onClick={submitWord}>
					Send
				</Button>
			</div>

			<div className="d-flex flex-column position-absolute bottom-0 start-0 w-100 align-items-center">
				<p>
					Last pair
				</p>
				<div className={`d-flex pt-2 ${styles.lastPair}`}>
					<div className={`d-flex flex-column align-items-center pt-2 pb-1 px-3 ${styles.me}`}>
						<p>{room.users[user.id!].lastWord || '-'}</p>
					</div>
					<div className={`d-flex flex-column align-items-center pt-2 pb-1 px-3 ${styles.teammate}`}>
						<p>{room.users[teammateId].lastWord || '-'}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

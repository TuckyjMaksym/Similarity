import React from 'react';
import { useRecoilValue } from 'recoil';

import { sUser, sApp } from '../../state';

import styles from './InfoPanel.module.css';

export const InfoPanel = () => {
    const app = useRecoilValue(sApp);
    const user = useRecoilValue(sUser);

    return (
        <div className={`d-flex align-items-center position-absolute top-0 w-100 px-4 ${styles.container}`}>
            <div className="d-flex">
                Hello,
                <p className={`ms-1 ${styles.username}`}>
                    {app.tempUsername || user.username}
                </p>
                {app.tempUsername && <div className="align-self-end blink_underscore" />}
            </div>
        </div>
    )
}

import React from "react";
import { RecoilRoot } from 'recoil';
import { render } from "react-dom";
import { App } from "./components/App";
import './services/socket.io';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/index.css';

render((
    <RecoilRoot>
        <App />
    </RecoilRoot>
), document.getElementById('root'));
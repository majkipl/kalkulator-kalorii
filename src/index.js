// /src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import {AuthProvider} from "./context/AuthContext";
import {AppProvider} from "./context/AppContext";
import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from "./shared/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    </React.StrictMode>
);

serviceWorkerRegistration.register();
reportWebVitals();

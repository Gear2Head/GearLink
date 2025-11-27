import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function App() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/"
                    element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

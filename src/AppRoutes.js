// /src/AppRoutes.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './components/auth/AuthPage';
import CatSelection from './shared/CatSelection';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<AuthPage />} />

            <Route
                path="/select-cat"
                element={
                    <ProtectedRoute>
                        <CatSelection />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/:catId"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Domyślna ścieżka dla zalogowanego użytkownika to teraz /select-cat */}
            <Route path="/" element={<Navigate to="/select-cat" replace />} />
            {/* Przekierowanie dla nieznanych ścieżek */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
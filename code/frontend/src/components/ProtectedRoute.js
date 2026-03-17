import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="text-center mt-5">Загрузка...</div>;
    }

    if (!user) {
        console.log("ProtectedRoute: User not authenticated, redirecting to /login from:", location.pathname);
        // Редирект на логин, если не авторизован
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
        console.warn(`ProtectedRoute: Access denied for roles ${user.roles}. Required one of: ${allowedRoles}`);
        // Редирект на страницу по умолчанию для роли, если доступа нет
        const roles = user.roles || [];
        if (roles.includes('ADMIN')) return <Navigate to="/admin" replace />;
        if (roles.includes('TRAINER')) return <Navigate to="/trainer" replace />;
        if (roles.includes('STUDENT')) return <Navigate to="/student" replace />;

        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

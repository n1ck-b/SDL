import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthModal.css";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { user, loginUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            console.log("AuthPage: User logged in, roles:", user.roles);
            const from = location.state?.from?.pathname || "/";
            const roles = user.roles || [];
            
            const isAdmin = roles.includes("ADMIN");
            const isTrainer = roles.includes("TRAINER");
            const isStudent = roles.includes("STUDENT");

            // Проверяем, имеет ли право текущий пользователь переходить на 'from'
            // Если он пытается перейти в админку, не будучи админом, или наоборот
            const isInvalidRedirect = 
                (from.startsWith("/admin") && !isAdmin) ||
                (from.startsWith("/trainer") && !isTrainer) ||
                (from.startsWith("/student") && !isStudent);

            if (from === "/" || from === "/login" || isInvalidRedirect) {
                if (isAdmin) navigate("/admin");
                else if (isTrainer) navigate("/trainer");
                else navigate("/student");
            } else {
                console.log("AuthPage: Navigating to valid saved 'from' path:", from);
                navigate(from);
            }
        }
    }, [user, navigate, location]);

    const handleSuccess = (authData) => {
        loginUser(authData);
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-tabs">
                    <button
                        className={isLogin ? "active" : ""}
                        onClick={() => setIsLogin(true)}
                    >
                        Вход
                    </button>
                    <button
                        className={!isLogin ? "active" : ""}
                        onClick={() => setIsLogin(false)}
                    >
                        Регистрация
                    </button>
                </div>
                <div className="auth-form-wrapper">
                    {isLogin ? (
                        <LoginForm onSuccess={handleSuccess} />
                    ) : (
                        <RegisterForm onSuccess={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

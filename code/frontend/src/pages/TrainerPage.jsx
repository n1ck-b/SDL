import React from 'react';
import { useAuth } from '../context/AuthContext';

const TrainerPage = () => {
    const { user } = useAuth();
    return (
        <div className="page-container">
            <h1 className="page-title">Личный кабинет тренера</h1>
            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                textAlign: 'center'
            }}>
                <p style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>
                    Добро пожаловать, <strong>{user?.name}</strong>!
                </p>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f3e5f5',
                    color: '#4a148c',
                    borderRadius: '8px',
                    fontSize: '1rem'
                }}>
                    👟 Функционал для тренеров находится в разработке. Здесь вы сможете управлять своими занятиями.
                </div>
            </div>
        </div>
    );
};

export default TrainerPage;

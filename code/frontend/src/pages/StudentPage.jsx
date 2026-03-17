import React from 'react';
import { useAuth } from '../context/AuthContext';

const StudentPage = () => {
    const { user } = useAuth();
    return (
        <div className="page-container">
            <h1 className="page-title">Личный кабинет студента</h1>
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
                    backgroundColor: '#e3f2fd',
                    color: '#0d47a1',
                    borderRadius: '8px',
                    fontSize: '1rem'
                }}>
                    ✨ Функционал для студентов находится в разработке. Скоро здесь появится ваше расписание и группы.
                </div>
            </div>
        </div>
    );
};

export default StudentPage;

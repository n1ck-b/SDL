// src/components/Halls/HallItem.jsx
import React from 'react';
import '../../styles/HallItem.css'; // Создадим этот CSS

const HallItem = ({ hall, onEdit, onDelete }) => {
    if (!hall) {
        return null;
    }

    // Отображение количества занятий в зале
    const scheduleItemsCount = hall.scheduleItemsId ? hall.scheduleItemsId.length : 0;

    return (
        <div className="hall-item-wrapper">
            <div className="hall-info">
                <h3 className="hall-name">{hall.name}</h3>
                <p className="hall-detail">Площадь: {hall.area} кв.м</p>
                <p className="hall-detail">Занятий в расписании: {scheduleItemsCount}</p>
            </div>
            <div className="hall-actions">
                <button onClick={() => onEdit(hall)} className="btn btn-secondary btn-sm">
                    Редактировать
                </button>
                <button
                    onClick={() => onDelete(hall.id)}
                    className="btn btn-danger btn-sm"
                >
                    Удалить
                </button>
            </div>
        </div>
    );
};

export default HallItem;
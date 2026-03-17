// src/pages/SchedulePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';
import '../styles/SchedulePage.css';

const SchedulePage = ({
                          halls,
                          groups,
                          scheduleItems,
                          isLoadingAppLevelData,
                          onAddSlotClick,
                          onViewItemClick,
                          onAddNewScheduleItemClick
                      }) => {
    const [selectedHallId, setSelectedHallId] = useState(null);
    const prevHallsRef = useRef(halls);

    useEffect(() => {
        if (isLoadingAppLevelData) {
            return;
        }

        if (!halls || halls.length === 0) {
            if (selectedHallId !== null) setSelectedHallId(null);
            prevHallsRef.current = halls;
            return;
        }

        const currentSelectedHallStillExists = selectedHallId && halls.some(h => h.id === selectedHallId);

        if (currentSelectedHallStillExists) {

        } else {
            setSelectedHallId(halls[0].id);
        }

        prevHallsRef.current = halls;

    }, [halls, isLoadingAppLevelData, selectedHallId]);

    // Если данные уровня приложения еще грузятся, или залы не загружены
    if (isLoadingAppLevelData && (!halls || halls.length === 0)) {
        return (
            <div className="schedule-page-container">
                <div className="page-header-controls">
                    <h1 className="page-title">Расписание занятий</h1>
                    {onAddNewScheduleItemClick && (<button className="btn btn-primary" onClick={() => { console.log("SchedulePage: 'Добавить занятие' button clicked (during load)"); onAddNewScheduleItemClick();}}>Добавить занятие</button>)}
                </div>
                <p>Загрузка данных залов...</p>
            </div>
        );
    }

    // Если загрузка завершена, но залов все равно нет
    if (!isLoadingAppLevelData && (!halls || halls.length === 0)) {
        return (
            <div className="schedule-page-container">
                <div className="page-header-controls">
                    <h1 className="page-title">Расписание занятий</h1>
                    {onAddNewScheduleItemClick && (<button className="btn btn-primary" onClick={() => { console.log("SchedulePage: 'Добавить занятие' button clicked (no halls)"); onAddNewScheduleItemClick();}}>Добавить занятие</button>)}
                </div>
                <p>Залы не загружены или отсутствуют. Расписание не может быть отображено.</p>
            </div>
        );
    }

    const selectedHall = halls.find(h => h.id === selectedHallId);
    const itemsForSelectedHall = scheduleItems.filter(item => item.hall?.id === selectedHallId || item.hallId === selectedHallId);

    const handleGridSlotClick = (dayKey, timeSlot) => {
        console.log("SchedulePage: handleGridSlotClick called", { dayKey, timeSlot, selectedHallId });
        if (selectedHallId && onAddSlotClick) {
            const initialDataForModal = { dayOfWeek: dayKey, time: timeSlot, hallId: selectedHallId };
            console.log("SchedulePage: Calling onAddSlotClick with", initialDataForModal);
            onAddSlotClick(initialDataForModal);
        } else {
            console.warn("SchedulePage: onAddSlotClick not called. selectedHallId:", selectedHallId, "onAddSlotClick exists:", !!onAddSlotClick);
        }
    };

    return (
        <div className="schedule-page-container">
            <div className="page-header-controls">
                <h1 className="page-title">Расписание занятий</h1>
                {onAddNewScheduleItemClick && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            console.log("SchedulePage: 'Добавить занятие' button clicked");
                            onAddNewScheduleItemClick();
                        }}
                    >
                        Добавить занятие
                    </button>
                )}
            </div>

            <div className="hall-selector-wrapper">
                <div className="hall-selector">
                    {halls.map(hall => (
                        <button
                            key={hall.id}
                            onClick={() => setSelectedHallId(hall.id)}
                            className={`btn ${selectedHallId === hall.id ? 'btn-primary' : 'btn-secondary'} hall-button`}
                            style={{marginRight: '12px'}}
                        >
                            {hall.name}
                        </button>
                    ))}
                </div>
            </div>

            {selectedHall ? (
                <ScheduleGrid
                    hall={selectedHall}
                    groups={groups}
                    scheduleItems={itemsForSelectedHall}
                    onSlotClick={handleGridSlotClick}
                    onItemClick={(item) => {
                        console.log("SchedulePage: onItemClick in ScheduleGrid triggered with item:", item);
                        if (onViewItemClick) {
                            onViewItemClick(item);
                        } else {
                            console.warn("SchedulePage: onViewItemClick is not defined!");
                        }
                    }}
                />
            ) : (
                halls && halls.length > 0 && <p>Выберите зал для отображения расписания.</p>
            )}
        </div>
    );
};

export default SchedulePage;
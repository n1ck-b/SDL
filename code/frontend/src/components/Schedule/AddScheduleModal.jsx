// src/components/Schedule/AddScheduleModal.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './../../styles/AddScheduleModal.css';
import GroupOptionContent from './GroupOptionContent';

const AddScheduleModal = ({
                              isOpen,
                              onClose,
                              onSave,
                              onUpdate,
                              onDelete,
                              groups = [],
                              halls = [],
                              initialData = null,
                              existingItem = null
                          }) => {
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const groupDropdownRef = useRef(null);

    const [selectedHallId, setSelectedHallId] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [currentItemId, setCurrentItemId] = useState(null);
    const [error, setError] = useState('');

    const isEditMode = !!existingItem;

    const days = [
        { value: 'Monday', label: 'ПН' }, { value: 'Tuesday', label: 'ВТ' },
        { value: 'Wednesday', label: 'СР' }, { value: 'Thursday', label: 'ЧТ' },
        { value: 'Friday', label: 'ПТ' }, { value: 'Saturday', label: 'СБ' },
        { value: 'Sunday', label: 'ВС' },
    ];
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 8; hour <= 22; hour++) {
            slots.push(`${hour < 10 ? '0' : ''}${hour}:00`);
        }
        return slots;
    }, []);
    const endTimeSlots = useMemo(() => [...timeSlots, '23:00'], [timeSlots]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
                setIsGroupDropdownOpen(false);
            }
        };
        if (isGroupDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isGroupDropdownOpen]);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setSearchTerm('');
            setIsGroupDropdownOpen(false);

            if (existingItem) {
                const groupObject = groups.find(g => g.id === (existingItem.group?.id || existingItem.groupId)) || null;
                setSelectedGroup(groupObject);
                setSelectedHallId(existingItem.hall?.id?.toString() || existingItem.hallId?.toString() || '');
                setDayOfWeek(existingItem.dayOfWeek || 'Monday');
                setStartTime(existingItem.startTime?.substring(0, 5) || '08:00');
                setEndTime(existingItem.endTime?.substring(0, 5) || '09:00');
                setCurrentItemId(existingItem.id);
            } else {
                setCurrentItemId(null);
                setSelectedGroup(null);
                setSelectedHallId(initialData?.hallId?.toString() || (halls.length > 0 ? halls[0].id.toString() : ''));
                setDayOfWeek(initialData?.dayOfWeek || 'Monday');
                const initialStartTimeFromSlot = initialData?.time || '08:00';
                setStartTime(initialStartTimeFromSlot);

                let desiredEndTime;
                const startHourInt = parseInt(initialStartTimeFromSlot.substring(0, 2));
                if (startHourInt >= 22) {
                    desiredEndTime = '23:00';
                } else {
                    desiredEndTime = `${(startHourInt + 1) < 10 ? '0' : ''}${startHourInt + 1}:00`;
                }
                const possibleEndTimes = endTimeSlots.filter(slot => slot > initialStartTimeFromSlot);
                if (possibleEndTimes.includes(desiredEndTime)) {
                    setEndTime(desiredEndTime);
                } else if (possibleEndTimes.length > 0) {
                    setEndTime(possibleEndTimes[0]);
                } else {
                    setEndTime(endTimeSlots[endTimeSlots.length - 1]);
                }
            }
        }
    }, [isOpen, initialData, existingItem, groups, halls, endTimeSlots]);

    useEffect(() => {
        if (isOpen) {
            const availableEndTimes = endTimeSlots.filter(slot => slot > startTime);
            if (!availableEndTimes.includes(endTime)) {
                if (availableEndTimes.length > 0) {
                    setEndTime(availableEndTimes[0]);
                }
            }
        }
    }, [startTime, endTime, endTimeSlots, isOpen]);


    const handleFormSubmit = (event) => {
        event.preventDefault();
        setError('');
        if (!selectedGroup || !selectedGroup.id) { setError('Пожалуйста, выберите группу.'); return; }
        if (!selectedHallId) { setError('Пожалуйста, выберите зал.'); return; }
        if (startTime >= endTime) { setError('Время начала должно быть раньше времени окончания.'); return; }

        const scheduleItemData = {
            hallId: parseInt(selectedHallId),
            groupId: parseInt(selectedGroup.id),
            dayOfWeek,
            startTime: `${startTime}:00`,
            endTime: `${endTime}:00`,
        };

        if (isEditMode && currentItemId) {
            onUpdate(currentItemId, scheduleItemData);
        } else {
            onSave(scheduleItemData);
        }
    };

    const handleDeleteClick = () => {
        if (currentItemId && onDelete) {
            if (window.confirm('Вы уверены, что хотите удалить это занятие? Это действие нельзя будет отменить.')) {
                onDelete(currentItemId);
            }
        }
    };

    let modalTitle = isEditMode ? "Редактировать занятие" : "Добавить занятие";
    if (isEditMode && selectedGroup) {
        modalTitle = `${'Занятие'}`;
    } else if (!isEditMode && initialData?.hallId && halls.length > 0) {
        const hallName = halls.find(h => h.id.toString() === initialData.hallId.toString())?.name || 'зале';
        modalTitle = `Добавить занятие`;
    }

    const filteredGroups = useMemo(() => groups.filter(group => {
        const term = searchTerm.toLowerCase();
        return (
            (group.name && group.name.toLowerCase().includes(term)) ||
            (group.trainer?.name && group.trainer.name.toLowerCase().includes(term)) ||
            (group.trainer?.danceStyle && group.trainer.danceStyle.toLowerCase().includes(term)) ||
            (group.difficulty && group.difficulty.toLowerCase().includes(term))
        );
    }), [groups, searchTerm]);

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setSearchTerm('');
        setIsGroupDropdownOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content add-schedule-modal-content">
                <div className="modal-header-custom">
                    <h2>{modalTitle}</h2>
                    {isEditMode && currentItemId && (
                        <button onClick={handleDeleteClick} className="btn btn-danger btn-sm" title="Удалить занятие">
                             Удалить
                        </button>
                    )}
                </div>
                {error && <p className="modal-error">{error}</p>}

                <form onSubmit={handleFormSubmit} className="modal-form-scrollable-content">
                    <div className="modal-body-content">
                        <div className="form-group">
                            <label htmlFor="hall">Зал:</label>
                            <select id="hall" value={selectedHallId} onChange={(e) => setSelectedHallId(e.target.value)} >
                                <option value="" disabled={!!selectedHallId}>Выберите зал</option>
                                {halls.map(hall => ( <option key={hall.id} value={hall.id.toString()}>{hall.name}</option> ))}
                            </select>
                        </div>

                        <div className="form-group custom-select-group" ref={groupDropdownRef}>
                            <label htmlFor="group-custom-select-input">Группа:</label>
                            <div
                                className={`custom-select-input ${isGroupDropdownOpen ? 'focused' : ''}`}
                                onClick={() => setIsGroupDropdownOpen(prev => !prev)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIsGroupDropdownOpen(prev => !prev);
                                    }
                                }}
                            >
                                {selectedGroup ? ( <GroupOptionContent item={{ group: selectedGroup }} /> )
                                    : ( <span className="custom-select-placeholder">Выберите группу...</span> )}
                                <span className={`custom-select-arrow ${isGroupDropdownOpen ? 'open' : ''}`}>▼</span>
                            </div>
                            {isGroupDropdownOpen && (
                                <div className="custom-select-dropdown">
                                    <input
                                        type="text"
                                        className="custom-select-search"
                                        placeholder="Поиск (название, тренер, стиль, сложность)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                    <div className="custom-select-options">
                                        {filteredGroups.length > 0 ? (
                                            filteredGroups.map(group => (
                                                <div
                                                    key={group.id}
                                                    className="custom-select-option"
                                                    onClick={() => handleGroupSelect(group)}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleGroupSelect(group);
                                                        }
                                                    }}
                                                >
                                                    <GroupOptionContent item={{ group: group }} />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="custom-select-no-options">Группы не найдены</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="dayOfWeekModal">День недели:</label>
                            <select id="dayOfWeekModal" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} >
                                {days.map(day => ( <option key={day.value} value={day.value}>{day.label}</option> ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="startTimeModal">Время начала:</label>
                            <select id="startTimeModal" value={startTime} onChange={(e) => setStartTime(e.target.value)} >
                                {timeSlots.map(time => ( <option key={time} value={time}>{time}</option> ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="endTimeModal">Время окончания:</label>
                            <select id="endTimeModal" value={endTime} onChange={(e) => setEndTime(e.target.value)} >
                                {endTimeSlots.filter(time => time > startTime).map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button onClick={onClose} type="button" className="btn btn-secondary">Отмена</button>
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddScheduleModal;
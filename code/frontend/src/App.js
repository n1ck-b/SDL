// App.js
import React, { useState, useEffect, useCallback, createContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SchedulePage from './pages/SchedulePage';
import GroupsPage from './pages/GroupsPage';
import TrainersPage from './pages/TrainersPage';
import StudentsPage from './pages/StudentsPage';
import HallsPage from './pages/HallsPage';
import AuthPage from './pages/AuthPage';
import StudentPage from './pages/StudentPage';
import TrainerPage from './pages/TrainerPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import AddScheduleModal from './components/Schedule/AddScheduleModal';
import {
    getAllGroups,
    addScheduleItem,
    fetchHalls,
    fetchScheduleItems,
    deleteScheduleItem,
    updateScheduleItem,
    getAllStudents,
    getAllTrainers
} from './services/api';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './styles/main.css';

// Создаем контекст для передачи данных и функций в AnimatedRoutes
const AppContext = createContext(null);

const RoleRedirect = () => {
    const { user } = useAuth();
    console.log("RoleRedirect: Checking user role", user?.roles);
    
    if (!user) {
        console.log("RoleRedirect: No user, redirecting to /login");
        return <Navigate to="/login" replace />;
    }
    
    const roles = user.roles || [];
    if (roles.includes('ADMIN')) {
        console.log("RoleRedirect: Admin detected, redirecting to /admin");
        return <Navigate to="/admin" replace />;
    }
    if (roles.includes('TRAINER')) {
        console.log("RoleRedirect: Trainer detected, redirecting to /trainer");
        return <Navigate to="/trainer" replace />;
    }
    if (roles.includes('STUDENT')) {
        console.log("RoleRedirect: Student detected, redirecting to /student");
        return <Navigate to="/student" replace />;
    }
    
    console.warn("RoleRedirect: User has no recognized roles, redirecting to /login");
    return <Navigate to="/login" replace />;
};

// Компонент-обертка для анимированных маршрутов
const AnimatedRoutes = () => {
    const location = useLocation();
    const nodeRefs = useRef({});

    const appContext = React.useContext(AppContext);
    if (!appContext) return null;

    const {
        halls, groups, scheduleItems, allStudents, allTrainers,
        isLoading: isLoadingAppLevelData,
        error: appError,
        handleOpenAddModal, handleOpenViewModal,
        showAppNotification, loadInitialData
    } = appContext;

    if (isLoadingAppLevelData && !appError) {
        return <p style={{ textAlign: 'center', padding: '20px' }}>Загрузка основных данных приложения...</p>;
    }
    if (appError && !isLoadingAppLevelData) {
        return <p style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{appError}</p>;
    }

    if (!nodeRefs.current[location.pathname]) {
        nodeRefs.current[location.pathname] = React.createRef();
    }
    const currentNodeRef = nodeRefs.current[location.pathname];

    return (
        <TransitionGroup component="div" className="route-section-wrapper">
            <CSSTransition
                key={location.pathname}
                nodeRef={currentNodeRef}
                timeout={600}
                classNames="page-transition"
                unmountOnExit
            >
                <div ref={currentNodeRef} className="page-container-for-transition">
                    <Routes location={location}>
                        <Route path="/" element={<RoleRedirect />} />
                        <Route path="/login" element={<AuthPage />} />
                        
                        <Route path="/student" element={
                            <ProtectedRoute allowedRoles={['STUDENT']}>
                                <StudentPage />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/trainer" element={
                            <ProtectedRoute allowedRoles={['TRAINER']}>
                                <TrainerPage />
                            </ProtectedRoute>
                        } />

                        {/* Все основные функции в /admin */}
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SchedulePage halls={halls} groups={groups} scheduleItems={scheduleItems} isLoadingAppLevelData={isLoadingAppLevelData} onAddSlotClick={handleOpenAddModal} onViewItemClick={handleOpenViewModal} onAddNewScheduleItemClick={() => handleOpenAddModal(null)} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/schedule" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <SchedulePage halls={halls} groups={groups} scheduleItems={scheduleItems} isLoadingAppLevelData={isLoadingAppLevelData} onAddSlotClick={handleOpenAddModal} onViewItemClick={handleOpenViewModal} onAddNewScheduleItemClick={() => handleOpenAddModal(null)} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/groups" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <GroupsPage appGroups={groups} appAllStudents={allStudents} appAllTrainers={allTrainers} isLoadingAppLevelData={isLoadingAppLevelData} showAppNotification={showAppNotification} onMajorDataChange={loadInitialData} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/trainers" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <TrainersPage appAllTrainers={allTrainers} isLoadingAppLevelData={isLoadingAppLevelData} showAppNotification={showAppNotification} onMajorDataChange={loadInitialData} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/students" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <StudentsPage appAllStudents={allStudents} isLoadingAppLevelData={isLoadingAppLevelData} showAppNotification={showAppNotification} onMajorDataChange={loadInitialData} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/halls" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <HallsPage appAllHalls={halls} isLoadingAppLevelData={isLoadingAppLevelData} showAppNotification={showAppNotification} onMajorDataChange={loadInitialData} />
                            </ProtectedRoute>
                        } />
                        
                        {/* Редирект для всех остальных путей */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </CSSTransition>
        </TransitionGroup>
    );
};


function AppContent() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialData, setModalInitialData] = useState(null);
    const [modalExistingItem, setModalExistingItem] = useState(null);

    const [groups, setGroups] = useState([]);
    const [halls, setHalls] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [allTrainers, setAllTrainers] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    const showAppNotification = useCallback((message, type, duration = 3000) => {
        setNotification({ message, type, show: true });
        setTimeout(() => { setNotification({ message: '', type: '', show: false }); }, duration);
    }, []);

    const reloadScheduleItems = useCallback(async () => {
        try {
            const scheduleItemsData = await fetchScheduleItems();
            setScheduleItems(scheduleItemsData || []);
        } catch (err) {
            console.error("App.js: Failed to fetch schedule items:", err);
            showAppNotification("Ошибка обновления данных расписания.", "error", 4000);
        }
    }, [showAppNotification]);

    const loadInitialData = useCallback(async () => {
        if (!user || !user.roles.includes('ADMIN')) return;
        
        setIsLoading(true);
        setError(null);
        let partialSuccess = false;
        try {
            const results = await Promise.allSettled([
                getAllGroups(), fetchHalls(), fetchScheduleItems(), getAllStudents(), getAllTrainers()
            ]);
            if (results[0].status === 'fulfilled' && results[0].value) { setGroups(results[0].value); partialSuccess = true; }
            if (results[1].status === 'fulfilled' && results[1].value) { setHalls(results[1].value); partialSuccess = true; }
            if (results[2].status === 'fulfilled' && results[2].value) { setScheduleItems(results[2].value); partialSuccess = true; }
            if (results[3].status === 'fulfilled' && results[3].value) { setAllStudents(results[3].value); partialSuccess = true; }
            if (results[4].status === 'fulfilled' && results[4].value) { setAllTrainers(results[4].value); partialSuccess = true; }
            
            if (!partialSuccess && results.some(r => r.status === 'rejected')) {
                const firstError = results.find(r => r.status === 'rejected');
                setError(firstError?.reason?.message || "Не удалось загрузить основные данные приложения.");
            }
        } catch (overallError) {
            console.error("App.js: Critical error during loadInitialData:", overallError);
            setError(overallError.message || "Критическая ошибка при загрузке данных.");
        } finally {
            setIsLoading(false);
        }
    }, [user, showAppNotification]);

    useEffect(() => {
        if (user && user.roles.includes('ADMIN')) {
            loadInitialData();
        }
    }, [user, loadInitialData]);

    const handleOpenAddModal = useCallback((initialDataForModal = null) => {
        setModalInitialData(initialDataForModal); setModalExistingItem(null); setIsModalOpen(true);
    }, []);
    const handleOpenViewModal = useCallback((item) => {
        setModalExistingItem(item); setModalInitialData(null); setIsModalOpen(true);
    }, []);
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false); setModalInitialData(null); setModalExistingItem(null);
    }, []);

    const handleSaveSchedule = useCallback(async (newScheduleData) => {
        try {
            await addScheduleItem(newScheduleData);
            showAppNotification("Занятие успешно добавлено!", "success");
            handleCloseModal();
            await reloadScheduleItems();
        } catch (error) {
            let detailedErrorMessage;
            if (error.status === 409) { detailedErrorMessage = "Данное время в этом зале занято"; }
            else { detailedErrorMessage = `Ошибка добавления: ${error.message}`; }
            showAppNotification(detailedErrorMessage, "error", 6000);
        }
    }, [reloadScheduleItems, showAppNotification, handleCloseModal]);

    const handleUpdateScheduleItem = useCallback(async (itemId, updatedScheduleData) => {
        try {
            await updateScheduleItem(itemId, updatedScheduleData);
            showAppNotification("Занятие успешно обновлено!", "success");
            handleCloseModal();
            await reloadScheduleItems();
        } catch (error) {
            let detailedErrorMessage;
            if (error.status === 409) { detailedErrorMessage = "Данное время в этом зале занято"; }
            else { detailedErrorMessage = `Ошибка обновления: ${error.message}`; }
            showAppNotification(detailedErrorMessage, "error", 7000);
        }
    }, [reloadScheduleItems, showAppNotification, handleCloseModal]);

    const handleDeleteScheduleItem = useCallback(async (itemId) => {
        try {
            await deleteScheduleItem(itemId);
            showAppNotification("Занятие успешно удалено!", "success");
            handleCloseModal();
            await reloadScheduleItems();
        } catch (error) {
            showAppNotification(`Ошибка удаления: ${error.message}`, "error");
        }
    }, [reloadScheduleItems, showAppNotification, handleCloseModal]);

    const appContextValue = {
        halls, groups, scheduleItems, allStudents, allTrainers,
        isLoading,
        error,
        handleOpenAddModal, handleOpenViewModal,
        showAppNotification, loadInitialData
    };

    if (isAuthLoading) return <div className="text-center mt-5">Загрузка приложения...</div>;

    return (
        <AppContext.Provider value={appContextValue}>
                <div className="app-layout">
                    {user && <Navbar />}
                    {notification.show && (<div className={`app-notification ${notification.type} ${notification.show ? 'show' : ''}`}>{notification.message}</div>)}

                    <div className={user ? "container mt-4 page-content-area" : "page-content-area"}>
                        <AnimatedRoutes />
                    </div>

                    <AddScheduleModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveSchedule}
                        onUpdate={handleUpdateScheduleItem}
                        onDelete={handleDeleteScheduleItem}
                        groups={groups}
                        halls={halls}
                        initialData={modalInitialData}
                        existingItem={modalExistingItem}
                    />
                </div>
        </AppContext.Provider>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
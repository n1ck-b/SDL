// src/services/api.js
const API_BASE_URL = '/api';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    // console.log(`[API] Запрос: ${options.method || 'GET'} ${url}`);
    // console.log(`[API] Тело запроса для ${options.method || 'GET'} ${url}:`, options.body);

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = {
        ...options,
        headers: headers,
        credentials: 'include'
    };

    try {
        const response = await fetch(url, config);
        // console.log(`[API] Статус ответа для ${options.method || 'GET'} ${url}: ${response.status}`);

        if (response.status === 401 && endpoint !== '/auth/login') {
            const success = await handleRefresh();
            if (success) {
                // Повторяем запрос с новым токеном
                return request(endpoint, options);
            }
        }

        if (!response.ok) {
            let errorData;
            let errorResponseMessage = response.statusText; // По умолчанию
            try {
                errorData = await response.json();
                if (errorData && errorData.message) {
                    errorResponseMessage = errorData.message;
                } else if (errorData && typeof errorData === 'string') {
                    errorResponseMessage = errorData;
                }
                // console.error(`[API] Ошибка ${response.status}. Тело JSON:`, errorData); // Раскомментируйте для отладки
            } catch (e) {
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorResponseMessage = errorText;
                    }
                    // console.error(`[API] Ошибка ${response.status}. Тело не JSON, а текст:`, errorText); // Раскомментируйте для отладки
                } catch (textError) {
                    // console.error(`[API] Ошибка ${response.status}. Не удалось прочитать тело ошибки ни как JSON, ни как текст.`); // Раскомментируйте для отладки
                }
            }
            const error = new Error(`Ошибка API: ${response.status}. ${errorResponseMessage}`);
            error.data = errorData;
            error.status = response.status;
            // console.error(`[API] Ошибка для ${options.method || 'GET'} ${url}:`, error.status, error.data?.message || error.message); // Дублирует логирование выше
            throw error;
        }

        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null;
        }

        const data = await response.json();
        // console.log(`[API] Получены данные для ${options.method || 'GET'} ${url}:`, data);
        return data;

    } catch (error) {
        if (error.name !== 'Error' || !error.status) {
            if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) {
                console.error(`[API] Ошибка сети или CORS для ${options.method || 'GET'} ${url}:`, error.message);
                throw new Error(`Ошибка сети или CORS: Не удалось выполнить запрос к ${url}. Проверьте доступность сервера и настройки CORS.`);
            }
        }
        // console.error(`[API] Общая ошибка в функции request для ${options.method || 'GET'} ${url}:`, error);
        throw error;
    }
}

async function handleRefresh() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            setAccessToken(data.accessToken);
            localStorage.setItem('token', data.accessToken);
            return true;
        }
    } catch (error) {
        console.error("Refresh failed", error);
    }

    // Если обновить не удалось — зачищаем всё
    console.warn("Session expired or refresh failed. Clearing storage and redirecting.");
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setAccessToken(null);
    window.location.href = '/login';
    return false;
}

export const logoutApi = async () => {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } catch (error) {
        console.error("Backend logout failed", error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setAccessToken(null);
    }
};

export const fetchScheduleItems = async () => {
    console.log("[API] Attempting to fetch schedule items...");
    try {
        const data = await request('/schedule_item');
        console.log("[API] Successfully fetched schedule items:", data ? data.length : 'null/undefined');
        return data;
    } catch (error) {
        console.error("[API] Error in fetchScheduleItems:", error.message, error.status, error.data);
        throw error;
    }
};

export const addScheduleItem = async (scheduleItemData) => {
    try {
        return await request('/schedule_item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleItemData),
        });
    } catch (error) {
        console.error("API Ошибка (addScheduleItem):", error.message);
        throw new Error(`Не удалось добавить занятие: ${error.message}`);
    }
};

export const getScheduleItemsByGroupId = async (groupId) => { // <--- НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/schedule_item/group/${groupId}`);
    } catch (error) {
        console.error(`API Ошибка (getScheduleItemsByGroupId groupId:${groupId}):`, error.message);
        throw new Error(`Не удалось загрузить расписание для группы ${groupId}: ${error.message}`);
    }
};

export const updateScheduleItem = async (itemId, scheduleItemData) => {
    try {
        return await request(`/schedule_item/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleItemData),
        });
    } catch (error) {
        console.error(`API Ошибка (updateScheduleItem id:${itemId}):`, error.message);
        throw new Error(`Не удалось обновить занятие ${itemId}: ${error.message}`);
    }
};

export const deleteScheduleItem = async (itemId) => {
    try {
        await request(`/schedule_item/${itemId}`, { method: 'DELETE' });
        return { success: true, message: "Занятие успешно удалено" };
    } catch (error) {
        console.error("API Ошибка (deleteScheduleItem):", error.message);
        throw new Error(`Не удалось удалить занятие: ${error.message}`);
    }
};

export const getAllGroups = async () => {
    try {
        return await request('/group');
    } catch (error) {
        console.error("API Ошибка (getAllGroups):", error.message);
        throw new Error(`Не удалось загрузить группы: ${error.message}`);
    }
};

export const getGroupById = async (id) => {
    try {
        return await request(`/group/${id}`);
    } catch (error) {
        console.error(`API Ошибка (getGroupById id:${id}):`, error.message);
        throw new Error(`Не удалось загрузить информацию о группе ${id}: ${error.message}`);
    }
};

export const createGroup = async (groupData) => {
    try {
        return await request('/group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData),
        });
    } catch (error) {
        console.error("API Ошибка (createGroup):", error.message);
        throw new Error(`Не удалось создать группу: ${error.message}`);
    }
};

export const updateGroup = async (id, groupData) => {
    try {
        return await request(`/group/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData),
        });
    } catch (error) {
        console.error(`API Ошибка (updateGroup id:${id}):`, error.message);
        throw new Error(`Не удалось обновить группу ${id}: ${error.message}`);
    }
};

export const deleteGroup = async (id) => {
    try {
        await request(`/group/${id}`, { method: 'DELETE' });
        return { success: true, message: `Группа успешно удалена` };
    } catch (error) {
        console.error(`API Ошибка (deleteGroup id:${id}):`, error.message);
        throw new Error(`Не удалось удалить группу ${id}: ${error.message}`);
    }
};

export const getScheduleItemDetails = async (id) => {
    try {
        return await request(`/schedule_item/${id}`);
    } catch (error) {
        console.error(`API Ошибка (getScheduleItemDetails id:${id}):`, error.message);
        throw error;
    }
};

export const getAllTrainers = async () => {
    try {
        return await request('/trainer');
    } catch (error) {
        console.error("API Ошибка (getAllTrainers):", error.message);
        throw new Error(`Не удалось загрузить список тренеров: ${error.message}.`);
    }
};

export const getTrainerById = async (id) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/trainer/${id}`);
    } catch (error) {
        console.error(`API Ошибка (getTrainerById id:${id}):`, error.message);
        throw new Error(`Не удалось загрузить информацию о тренере ${id}: ${error.message}`);
    }
};

export const createTrainer = async (trainerData) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request('/trainer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainerData),
        });
    } catch (error) {
        console.error("API Ошибка (createTrainer):", error.message);
        throw new Error(`Не удалось создать тренера: ${error.message}`);
    }
};

export const updateTrainer = async (id, trainerData) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/trainer/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainerData),
        });
    } catch (error) {
        console.error(`API Ошибка (updateTrainer id:${id}):`, error.message);
        throw new Error(`Не удалось обновить тренера ${id}: ${error.message}`);
    }
};

export const deleteTrainer = async (id) => { // НОВАЯ ФУНКЦИЯ
    try {
        await request(`/trainer/${id}`, { method: 'DELETE' });
        return { success: true, message: `Тренер ${id} успешно удален` };
    } catch (error) {
        console.error(`API Ошибка (deleteTrainer id:${id}):`, error.message);
        throw new Error(`Не удалось удалить тренера ${id}: ${error.message}`);
    }
};

export const getAllStudents = async () => {
    try {
        return await request('/student');
    } catch (error) {
        console.error("API Ошибка (getAllStudents):", error.message);
        throw new Error(`Не удалось загрузить список студентов: ${error.message}`);
    }
};

export const getStudentById = async (id) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/student/${id}`);
    } catch (error) {
        console.error(`API Ошибка (getStudentById id:${id}):`, error.message);
        throw new Error(`Не удалось загрузить информацию о студенте ${id}: ${error.message}`);
    }
};

export const createStudent = async (studentData) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request('/student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData), // Ожидает name, phoneNumber
        });
    } catch (error) {
        console.error("API Ошибка (createStudent):", error.message);
        throw new Error(`Не удалось создать студента: ${error.message}`);
    }
};

export const updateStudent = async (id, studentData) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/student/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData), // Ожидает name, phoneNumber
        });
    } catch (error) {
        console.error(`API Ошибка (updateStudent id:${id}):`, error.message);
        throw new Error(`Не удалось обновить студента ${id}: ${error.message}`);
    }
};

export const deleteStudent = async (id) => { // НОВАЯ ФУНКЦИЯ
    try {
        await request(`/student/${id}`, { method: 'DELETE' });
        return { success: true, message: `Студент ${id} успешно удален` };
    } catch (error) {
        console.error(`API Ошибка (deleteStudent id:${id}):`, error.message);
        throw new Error(`Не удалось удалить студента ${id}: ${error.message}`);
    }
};

export const fetchHalls = async () => { // Уже существует (GET all)
    try {
        return await request('/hall');
    } catch (error) {
        console.error("API Ошибка (fetchHalls):", error.message);
        throw new Error(`Не удалось загрузить залы: ${error.message}`);
    }
};

export const getHallById = async (id) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/hall/${id}`);
    } catch (error) {
        console.error(`API Ошибка (getHallById id:${id}):`, error.message);
        throw new Error(`Не удалось загрузить информацию о зале ${id}: ${error.message}`);
    }
};

export const createHall = async (hallData) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request('/hall', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData), // Ожидает name, area
        });
    } catch (error) {
        console.error("API Ошибка (createHall):", error.message);
        throw new Error(`Не удалось создать зал: ${error.message}`);
    }
};

export const updateHall = async (id, hallData) => { // НОВАЯ ФУНКЦИЯ
    try {
        return await request(`/hall/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData), // Ожидает name, area
        });
    } catch (error) {
        console.error(`API Ошибка (updateHall id:${id}):`, error.message);
        throw new Error(`Не удалось обновить зал ${id}: ${error.message}`);
    }
};

export const deleteHall = async (id) => { // НОВАЯ ФУНКЦИЯ
    try {
        await request(`/hall/${id}`, { method: 'DELETE' });
        return { success: true, message: `Зал ${id} успешно удален` };
    } catch (error) {
        console.error(`API Ошибка (deleteHall id:${id}):`, error.message);
        throw new Error(`Не удалось удалить зал ${id}: ${error.message}`);
    }
};

export const login = async (data) => {
    const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (response.accessToken) {
        setAccessToken(response.accessToken);
        localStorage.setItem('token', response.accessToken);
    }
    return response;
};

export const register = async (data) => {
    const response = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (response.accessToken) {
        setAccessToken(response.accessToken);
        localStorage.setItem('token', response.accessToken);
    }
    return response;
};

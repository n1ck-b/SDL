import { useState } from "react";
import {register, setAccessToken} from "../../services/api";
import { useNavigate } from "react-router-dom";

const phoneRegex = /^\+?[0-9]{10,15}$/;
const nameRegex = /^[A-Za-zА-Яа-яЁё\s-]{2,30}$/;

const RegisterForm = ({ onSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        phoneNumber: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!nameRegex.test(formData.username)) {
            newErrors.username = "Имя может содержать только буквы";
        }

        if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Введите корректный номер телефона";
        }

        if (formData.password.length < 6) {
            newErrors.password = "Пароль должен содержать минимум 6 символов";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setServerError("");

        try {
            const response = await register(formData);

            if (onSuccess) onSuccess(response);

        } catch (error) {
            setServerError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
                <input
                    type="text"
                    name="username"
                    placeholder="Имя"
                    value={formData.username}
                    onChange={handleChange}
                />
                {errors.username && <span className="error">{errors.username}</span>}
            </div>

            <div className="input-group">
                <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Номер телефона"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />
                {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
            </div>

            <div className="input-group">
                <input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
            {serverError && <div className="server-error">{serverError}</div>}
        </form>
    );
};

export default RegisterForm;

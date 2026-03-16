import { useState } from "react";
import { login } from "../../services/api";

const phoneRegex = /^\+?[0-9]{10,15}$/;

const LoginForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        phoneNumber: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};

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
        setError("");
        setLoading(true);

        try {
            const user = await login(formData);

            if (onSuccess) onSuccess(user);

        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
                <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Номер телефона"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Загрузка..." : "Войти"}
            </button>

            {error && <div className="server-error">{error}</div>}
        </form>

    );
};

export default LoginForm;

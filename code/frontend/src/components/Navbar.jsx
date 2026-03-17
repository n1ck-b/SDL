import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './../styles/Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        console.log("Navbar: Performing full logout and reload");
        await logout();
        // Используем прямой переход для 100% надежности при выходе, 
        // чтобы избежать прерывания навигации при размонтировании Navbar
        window.location.href = '/login';
    };

    if (!user) return null;

    const isAdmin = user.roles.includes('ADMIN');

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="logo-icon">💃</span>
                    <span className="logo-text">Dance Center</span>
                </Link>

                <div className="navbar-links">
                    {isAdmin && (
                        <>
                            <Link
                                to="/admin/schedule"
                                className={`nav-link ${location.pathname === '/admin/schedule' ? 'active' : ''}`}
                            >
                                Расписание
                            </Link>
                            <Link
                                to="/admin/groups"
                                className={`nav-link ${location.pathname === '/admin/groups' ? 'active' : ''}`}
                            >
                                Группы
                            </Link>
                            <Link
                                to="/admin/trainers"
                                className={`nav-link ${location.pathname === '/admin/trainers' ? 'active' : ''}`}
                            >
                                Тренеры
                            </Link>
                            <Link
                                to="/admin/students"
                                className={`nav-link ${location.pathname === '/admin/students' ? 'active' : ''}`}
                            >
                                Студенты
                            </Link>
                            <Link
                                to="/admin/halls"
                                className={`nav-link ${location.pathname === '/admin/halls' ? 'active' : ''}`}
                            >
                                Залы
                            </Link>
                        </>
                    )}
                    
                    {user.roles.includes('TRAINER') && (
                        <Link to="/trainer" className={`nav-link ${location.pathname === '/trainer' ? 'active' : ''}`}>
                            Личный кабинет
                        </Link>
                    )}
                    
                    {user.roles.includes('STUDENT') && (
                        <Link to="/student" className={`nav-link ${location.pathname === '/student' ? 'active' : ''}`}>
                            Личный кабинет
                        </Link>
                    )}

                    <div className="user-section">
                        <span className="user-name">
                            {user.name}
                        </span>
                        <button className="btn btn-outline-white" onClick={handleLogout} style={{marginLeft: '20px', padding: '0.4rem 1rem'}}>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
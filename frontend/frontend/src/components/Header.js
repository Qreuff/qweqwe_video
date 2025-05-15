// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo.png';
import './Header.css'; // <-- Убедитесь, что файл импортирован

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const isLoggedIn = localStorage.getItem('access_token');

  return (
    <header className="header"> {/* Используем CSS класс */}
      <div className="header-logo-container"> {/* Используем CSS класс */}
        <Link to="/">
          <img src={logo} alt="Логотип" className="header-logo" /> {/* Используем CSS класс */}
        </Link>
      </div>
      <nav className="header-nav"> {/* Используем CSS класс */}
        <Link to="/" className="nav-link">main</Link>
        {isLoggedIn ? (
          <>
            <Link to="/account" className="nav-link">account</Link>
            <button onClick={handleLogout} className="nav-link logout-button">logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">log in</Link>
            {/* <Link to="/register" className="nav-link">Регистрация</Link> */}
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
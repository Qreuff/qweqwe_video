import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleError = (err) => {
    let errorMessage = 'Произошла ошибка';
    if (err.response && err.response.data) {
      if (err.response.data.detail) {
        errorMessage = err.response.data.detail;
      } else if (typeof err.response.data === 'object') {
        errorMessage = Object.entries(err.response.data)
          .map(([key, value]) => {
            const fieldName = {
              username: 'Имя пользователя',
              email: 'Email',
              password: 'Пароль',
              password2: 'Подтверждение пароля',
              access_code: 'Код доступа',
              non_field_errors: 'Ошибка'
            }[key] || key;
            return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
          })
          .join('; ');
      } else {
        errorMessage = JSON.stringify(err.response.data);
      }
    }
    setError(errorMessage);
    setTimeout(() => setError(''), 7000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setTimeout(() => setError(''), 7000);
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/register/', {
        username,
        email,
        password,
        password2: confirmPassword,
        access_code: accessCode
      });
      alert('Регистрация успешна!');
      setIsRegistering(false);
      setError('');
      setEmail('');
      setConfirmPassword('');
      setAccessCode('');
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('access_token', res.data.access);
      if (res.data.refresh) {
        localStorage.setItem('refresh_token', res.data.refresh);
      }
      navigate('/');
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#e9ecef',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <Header />
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginBottom: '30px', color: '#333' }}>
          {isRegistering ? 'Регистрация' : 'Вход'}
        </h2>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '15px',
            textAlign: 'left',
            wordBreak: 'break-word'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />

          {isRegistering && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {isRegistering && (
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          {isRegistering && (
            <input
              type="text"
              placeholder="Код доступа"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <button type="submit" style={buttonStyle}>
            {isRegistering ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setEmail('');
            setPassword('');
            setUsername('');
            setConfirmPassword('');
            setAccessCode('');
          }}
          style={{
            marginTop: '25px',
            backgroundColor: 'transparent',
            color: '#black',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          {isRegistering ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '12px',
  borderRadius: '5px',
  border: '1px solid #ced4da',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box',
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '20px',
  transition: 'background-color 0.2s ease',
};

export default Login;

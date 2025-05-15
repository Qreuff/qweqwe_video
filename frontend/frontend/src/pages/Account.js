// src/pages/Account.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/Account.module.css';
import backgroundImage from './background.png';

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, videosResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/auth/me/', {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get('http://localhost:8000/api/videos/user/', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);

        setUserData(userResponse.data);
        setUserVideos(videosResponse.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные аккаунта.');

        if (err.response && err.response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это видео?')) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/videos/${videoId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUserVideos(userVideos.filter(video => video.id !== videoId));
      console.log(`Видео ${videoId} успешно удалено.`);
    } catch (err) {
      console.error('Ошибка удаления видео:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      } else {
        alert('Произошла ошибка при удалении видео.');
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка данных аккаунта...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.profileSection}>
        <h2>Профиль пользователя</h2>
        {userData && (
          <div className={styles.profileInfo}>
            <p>Имя: {userData.username}</p>
            <p>Email: {userData.email}</p>
            <p>Дата регистрации: {new Date(userData.date_joined).toLocaleDateString()}</p>
          </div>
        )}

        <Link to="/upload" className={styles.uploadButton}>
          Загрузить новое видео
        </Link>
      </div>

      <div className={styles.videosSection}>
        <h3>Мои видео ({userVideos.length})</h3>

        {userVideos.length === 0 ? (
          <p>У вас пока нет загруженных видео</p>
        ) : (
          <div className={styles.videoGrid}>
            {userVideos.map(video => (
              <div key={video.id} className={styles.videoCard}>
                <div className={styles.thumbnail}>
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title || 'Видео без названия'} />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '180px',
                        backgroundColor: '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Нет миниатюры
                    </div>
                  )}
                </div>
                <div className={styles.videoInfo}>
                  <h4>{video.title}</h4>
                  <p>{video.description ? (video.description.length > 100 ? video.description.substring(0, 100) + '...' : video.description) : 'Без описания'}</p>
                  <div className={styles.meta}>
                    <span>Просмотры: {video.views !== undefined ? video.views : 'N/A'}</span>
                    <span>Дата: {video.uploaded_at ? new Date(video.uploaded_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className={styles.deleteButton}
                    >
                      Удалить
                    </button>
                    <Link
                      to={`/video/${video.id}`}
                      className={styles.watchButton}
                    >
                      Смотреть
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;

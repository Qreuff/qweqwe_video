// src/pages/VideoPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import axios from 'axios';
import Header from '../components/Header';
// --- ДОБАВЛЕНО: Импорт компонента комментариев ---
import VideoComments from '../components/VideoComments';
// --- Конец добавленного импорта ---
// --- ДОБАВЛЕНО: Импорт стилей страницы ---
import './styles/VideoPage.css';
// --- Конец добавленного импорта стилей ---


const VideoPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // --- ДОБАВЛЕНО: Проверка статуса авторизации для передачи в компонент комментариев ---
    const isLoggedIn = !!localStorage.getItem('access_token'); // Проверяем наличие токена
    // --- Конец добавленной проверки ---


    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/videos/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                setVideo(response.data);
            } catch (err) {
                setError('Ошибка загрузки видео');
                // Если видео не найдено (например, 404), можно установить video в null явно,
                // хотя ваше начальное состояние handleit already.
                if (err.response && err.response.status === 404) {
                    setVideo(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]); // Перезагружаем видео при изменении ID в URL

    // Состояние загрузки или ошибки
    if (loading) return <div className="page-message">Загрузка...</div>; // Optional CSS class for messages
    if (error && !video) return <div className="page-message">{error}</div>; // Показываем ошибку, только если видео не загружено
    if (!video && !loading) return <div className="page-message">Видео не найдено</div>; // Показываем, если видео нет и загрузка завершена


    return (
        <div>
            <Header />
            {/* --- ИЗМЕНЕНО: Основной контейнер теперь использует стили из CSS файла --- */}
            {/* Убраны inline стили и применен CSS класс .content-layout */}
            <div className="content-layout">

                {/* --- Блок слева: Видео плеер и информация о видео --- */}
                 {/* Убраны inline стили и применен CSS класс .video-and-info */}
                <div className="video-and-info">
                    {/* Video player wrapper - inline styles are necessary here for aspect ratio */}
                     {/* Убраны inline стили из player-wrapper и react-player в CSS */}
                    <div className="player-wrapper">
                        <ReactPlayer
                            className="react-player"
                            url={video.file_url} // Используем file_url из сериализатора
                            controls
                            width="100%" // Width and height controlled by parent with aspect ratio padding
                            height="100%"
                            config={{
                                file: {
                                    attributes: {
                                        controlsList: 'nodownload' // Отключить скачивание
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Video information block */}
                    {/* Убраны inline стили из video-info и его параграфов/заголовков в CSS */}
                    <div className="video-info">
                        <h1>{video.title}</h1>
                        <p>{video.author_username} • {new Date(video.uploaded_at).toLocaleDateString()}</p> {/* Убраны inline стили */}
                        <p>{video.description}</p> {/* Убраны inline стили */}
                    </div>
                </div> {/* Конец блока video-and-info */}

                {/* --- Блок справа: Комментарии --- */}
                 {/* Убраны inline стили и применен CSS класс .comments-sidebar */}
                <div className="comments-sidebar">
                    {/* Используем компонент VideoComments */}
                    {/* Стили комментариев задаются в VideoComments.css */}
                    <VideoComments videoId={id} isLoggedIn={isLoggedIn} />
                </div> {/* Конец блока comments-sidebar */}

            </div> {/* Конец основного контейнера content-layout */}
        </div>
    );
};

export default VideoPage;
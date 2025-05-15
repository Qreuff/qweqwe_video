// src/pages/Home.js
import React, { useEffect, useState } from 'react';
// import Header from '../components/Header'; // Header должен рендериться в App.js
import VideoCard from '../components/VideoCard';
import axios from 'axios';
import backgroundImage from './background.png'; // <-- Импортируем файл фонового изображения (Убедитесь, что имя файла правильное)


const Home = () => {
  // Состояние для хранения списка видео, полученных с бэкенда
  const [videos, setVideos] = useState([]);
  // Состояние для отслеживания загрузки данных
  const [loading, setLoading] = useState(true);
  // Состояние для хранения ошибок
  const [error, setError] = useState(null);

  // Хук useEffect для загрузки данных при монтировании компонента
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Устанавливаем состояние загрузки в true
        setLoading(true);
        // Выполняем GET-запрос к API для получения списка видео
        // Убедитесь, что ваш бэкенд имеет эндпоинт для получения всех видео,
        // который доступен без авторизации, если это главная страница.
        // Если нужно показывать разные видео для авторизованных/неавторизованных,
        // логика запроса может отличаться. Здесь предполагается общий доступ.
        const response = await axios.get('http://localhost:8000/api/videos/');
        // Обновляем состояние списка видео
        setVideos(response.data);
        setError(null); // Сбрасываем состояние ошибки
      } catch (err) {
        console.error("Ошибка при загрузке видео:", err);
        // Устанавливаем состояние ошибки
        setError('Не удалось загрузить список видео.');
      } finally {
        // В любом случае (успех или ошибка) отключаем состояние загрузки
        setLoading(false);
      }
    };

    // Вызываем функцию загрузки видео
    fetchVideos();
  }, []); // Пустой массив зависимостей означает, что хук сработает один раз при монтировании

  // Если данные загружаются, показываем сообщение о загрузке
  if (loading) {
    return (
      // Убедитесь, что Header рендерится на более высоком уровне (например, в App.js)
      // Добавляем отступ сверху, чтобы текст не перекрывался фиксированной шапкой
      <div style={{ textAlign: 'center', marginTop: '80px' }}>Загрузка видео...</div>
    );
  }

  // Если произошла ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      // Убедитесь, что Header рендерится на более высоком уровне (например, в App.js)
      // Добавляем отступ сверху, чтобы текст не перекрывался фиксированной шапкой
      <div style={{ textAlign: 'center', marginTop: '80px', color: 'red' }}>Ошибка: {error}</div>
    );
  }

  // Если видео успешно загружены, отображаем их
  return (
    // --- Основной контейнер страницы с фоновым изображением и базовым макетом ---
    <div style={{
        // Стили фонового изображения
        backgroundImage: `url(${backgroundImage})`, // Устанавливаем фоновое изображение
        backgroundSize: 'cover', // Растягиваем изображение, чтобы оно покрывало весь контейнер
        backgroundPosition: 'center', // Центрируем изображение
        backgroundRepeat: 'no-repeat', // Отключаем повторение изображения
        backgroundAttachment: 'fixed', // Фон не прокручивается с контентом

        // Стили макета для полного охвата и расположения контента
        width: '100vw', // Гарантируем ширину равную ширине окна просмотра
        minHeight: '100vh', // Гарантируем минимальную высоту
        margin: 0, // Убираем стандартные внешние отступы
        padding: 0, // Убираем стандартные внутренние отступы
        boxSizing: 'border-box', // Учитываем padding в размере элемента
        overflowX: 'hidden', // Скрываем горизонтальный перелив

        // Flexbox для расположения содержимого по вертикали и горизонтали
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Центрируем блоки по горизонтали
        // justifyContent: 'flex-start', // Контент начинается сверху (по умолчанию flex-start)

        // Отступ сверху для фиксированной шапки
        // !!! ВАЖНО: Убедитесь, что это значение ТОЧНО соответствует ВЫСОТЕ вашей шапки (Header),
        // включая ее padding и border. Используйте инструменты разработчика браузера, чтобы измерить фактическую высоту шапки.
        // Этот padding нужен, чтобы контент не перекрывался фиксированной шапкой,
        // если сама шапка рендерится на более высоком уровне.
        paddingTop: '80px', // Примерное значение, скорректируйте при необходимости

    }}>
      {/* --- Внутренний контейнер для центрирования и ограничения ширины контента --- */}
      <div style={{
          width: '100%', // Занимает всю доступную ширину родителя (который 100vw)
          maxWidth: '1200px', // Ограничиваем максимальную ширину контента
          margin: '0 auto', // Центрируем этот блок
          padding: '0 20px', // Добавляем горизонтальные отступы к контенту, чтобы он не прилипал к краям на узких экранах
          boxSizing: 'border-box', // Учитываем padding в ширине
          // Возможно, потребуется добавить padding-bottom, если контент доходит до низа
          // paddingBottom: '20px',
      }}>
         <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'white', textShadow: '4px 4px 6px rgba(0,0,0,0.5)' }}> {/* Добавлены стили для читаемости на фоне */}
            videos
          </h1>

         {/* Удалены пробелы и переносы строк вокруг условного рендеринга и внутри map */}
         {videos.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Видео пока нет.</div>
         ) : (
            <div
              className="video-grid" // Оставляем класс, если он используется в других стилях
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Настройте minmax по вашему усмотрению
                gap: '20px',
                // padding и maxWidth/margin теперь управляются внешним div
              }}
          >{videos.map(video => (<VideoCard key={video.id} id={video.id} title={video.title} description={video.description} thumbnail={video.thumbnail} />))}</div>
         )}
      </div> {/* Конец внутреннего контейнера */}
    </div>
  );
};

export default Home;
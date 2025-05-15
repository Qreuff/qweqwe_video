import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Убедитесь, что импорт Header правильный, если он используется

const Upload = () => {
  // Исправлена ошибка: переменная состояния 'file' теперь используется
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    // Если токена нет, перенаправляем на страницу входа
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, [navigate]); // Зависимость от navigate

  // Обработчик выбора файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    console.log('Выбран файл:', selectedFile); // Отладка: информация о выбранном файле

    // Проверка типа файла
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setError('Поддерживаются только файлы MP4, WebM и OGG');
      setFile(null); // Сбрасываем выбранный файл
      e.target.value = null; // Очищаем значение input[type="file"] для возможности выбрать тот же файл снова
      console.log('Ошибка типа файла.'); // Отладка
      return;
    }

    // Проверка размера файла (макс. 500MB)
    if (selectedFile && selectedFile.size > 500 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 500MB');
      setFile(null); // Сбрасываем выбранный файл
      e.target.value = null; // Очищаем значение input[type="file"]
      console.log('Ошибка размера файла.'); // Отладка
      return;
    }

    // Если файл прошел проверки
    setFile(selectedFile);
    setError(''); // Сбрасываем ошибку
    console.log('Файл успешно выбран и прошел проверки.'); // Отладка
  };

  // Обработчик загрузки файла
  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Сбрасываем предыдущие ошибки перед новой попыткой загрузки

    if (!file) {
      setError('Выберите файл для загрузки');
      setLoading(false);
      console.log('Попытка загрузки без выбранного файла.'); // Отладка
      return;
    }

    const formData = new FormData();
    // Убедитесь, что ключ 'video' соответствует имени поля в модели/сериализаторе на бэкенде
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    console.log('Формирование FormData...'); // Отладка
    // Отладка содержимого FormData (может быть сложно увидеть сам файл, но видно ключи)
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    console.log('Объект FormData:', formData); // Отладка: вывод самого объекта FormData

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
          setError('Вы не авторизованы. Пожалуйста, войдите.');
          setLoading(false);
          navigate('/login'); // Перенаправляем на страницу входа, если токена нет
          return;
      }

      console.log('Отправка запроса на загрузку...'); // Отладка
      const response = await axios.post('http://localhost:8000/api/videos/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Используем полученный токен
          // 'Content-Type': 'multipart/form-data', // Axios устанавливает этот заголовок автоматически для FormData
        },
        // Опционально: добавьте индикатор прогресса загрузки
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Прогресс загрузки: ${percentCompleted}%`); // Отладка прогресса
            // Здесь можно обновить состояние для отображения прогресса пользователю
        }
      });

      console.log('Видео успешно загружено:', response.data); // Отладка
      // Перенаправляем на страницу просмотра загруженного видео
      navigate(`/video/${response.data.id}`);

    } catch (err) {
      console.error('Ошибка при загрузке видео:', err.response || err); // Отладка: выводим ответ ошибки или саму ошибку
      let errorMessage = 'Ошибка загрузки видео';

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Сессия истекла или вы не авторизованы. Пожалуйста, войдите снова.';
          // Удаляем недействительные токены и перенаправляем при 401
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        } else if (err.response.status === 415) {
          errorMessage = 'Неподдерживаемый формат видео. Используйте MP4, WebM или OGG';
        } else if (err.response.data && typeof err.response.data === 'object') {
            // Попытка извлечь ошибки валидации из ответа DRF
            errorMessage = Object.entries(err.response.data)
                .map(([key, value]) => {
                    // Переводим стандартные имена полей из DRF, если нужно
                    const fieldName = {
                         video: 'Видеофайл',
                         title: 'Название',
                         description: 'Описание',
                         non_field_errors: 'Ошибка' // Для ошибок, не связанных с конкретным полем
                    }[key] || key; // Если имя поля не найдено в словаре, используем его как есть
                    return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                })
                .join('; '); // Соединяем несколько ошибок точкой с запятой
        } else {
          // Общий случай для других ошибок ответа
          errorMessage = err.response.data?.detail || JSON.stringify(err.response.data) || errorMessage;
        }
      } else if (err.request) {
          // Ошибка запроса (например, нет соединения с бэкендом)
          errorMessage = 'Не удалось отправить запрос. Проверьте соединение с сервером.';
      } else {
          // Другие ошибки
          errorMessage = err.message;
      }

      setError(errorMessage); // Устанавливаем сообщение об ошибке для пользователя
    } finally {
      setLoading(false); // В любом случае отключаем индикатор загрузки
    }
  };

  // --- JSX Рендеринг формы загрузки ---
  return (
    // Добавляем контейнер для центрирования формы на странице
    <div style={{
        display: 'flex', // Используем flexbox
        flexDirection: 'column', // Элементы внутри располагаются по вертикали
        alignItems: 'center', // Выравниваем элементы по центру по горизонтали
        justifyContent: 'center', // Выравниваем элементы по центру по вертикали
        minHeight: 'calc(100vh - 60px)', // Занимаем почти всю высоту окна (учитываем Header, если он фиксирован)
        padding: '20px', // Небольшие отступы по краям
        boxSizing: 'border-box' // Включаем padding в размер элемента
    }}>
       {/* Header здесь, возможно, не нужен, если это отдельная страница /upload без общей навигации */}
       {/* <Header /> */}

        {/* --- БЛОК ФОРМЫ (Стилизованный контейнер) --- */}
        <div style={{
            backgroundColor: '#ffffff', // Белый фон для самого блока формы
            padding: '40px', // Внутренние отступы блока
            borderRadius: '8px', // Скругленные углы
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Красивая тень
            maxWidth: '600px', // Максимальная ширина блока (можно настроить)
            width: '100%', // Блок занимает 100% доступной ширины до maxWidth
            textAlign: 'center', // Центрируем текст внутри (например, заголовки)
            marginTop: '20px', // Отступ сверху (может быть нужен, если есть шапка)
            marginBottom: '20px' // Отступ снизу
        }}>
            {/* Заголовок формы */}
            <h2 style={{ marginBottom: '30px', color: '#333' }}>
                Загрузить видео
            </h2>

            {/* Сообщение об ошибке */}
            {error && (
                <div
                   className="error-message" // Оставляем класс, если он используется в других стилях
                   style={{ // Добавляем inline стили
                     padding: '12px',
                     backgroundColor: '#f8d7da', // Светло-красный фон
                     color: '#721c24', // Темно-красный текст
                     border: '1px solid #f5c6cb', // Красная рамка
                     borderRadius: '5px',
                     marginBottom: '20px', // Отступ снизу от формы
                     fontSize: '15px',
                     textAlign: 'left', // Выравнивание текста ошибки по левому краю
                     wordBreak: 'break-word' // Перенос длинных слов
                   }}
                >
                  {error}
                </div>
            )}

            {/* --- САМА ФОРМА --- */}
            <form
               onSubmit={handleUpload}
               style={{ // Стилизация формы как flex-контейнера
                 display: 'flex',
                 flexDirection: 'column', // Поля располагаются вертикально
                 gap: '15px' // Расстояние между полями и кнопками внутри формы
               }}
            >
                {/* Поле Название видео */}
                <input
                    type="text"
                    placeholder="Название видео"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required // Поле обязательное
                    style={{ // Стилизация поля ввода
                       padding: '12px', // Внутренние отступы
                       borderRadius: '5px', // Скругленные углы
                       border: '1px solid #ced4da', // Цвет рамки
                       fontSize: '16px', // Размер шрифта
                       width: '100%', // Растягиваем на всю ширину контейнера
                       boxSizing: 'border-box', // Учитываем padding и border в ширине
                    }}
                />

                {/* Поле Описание */}
                 <textarea
                    placeholder="Описание видео"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ // Стилизация текстового поля
                       padding: '12px',
                       borderRadius: '5px',
                       border: '1px solid #ced4da',
                       fontSize: '16px',
                       width: '100%',
                       boxSizing: 'border-box',
                       minHeight: '100px', // Минимальная высота
                       resize: 'vertical' // Разрешить изменение размера только по вертикали
                    }}
                />

                {/* Поле Видеофайл */}
                 <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg" // Указываем допустимые типы файлов
                    onChange={handleFileChange} // Обработчик выбора файла
                    required // Поле обязательное
                    style={{ // Стилизация поля выбора файла
                       padding: '12px',
                       borderRadius: '5px',
                       border: '1px solid #ced4da',
                       fontSize: '16px',
                       width: '100%',
                       boxSizing: 'border-box',
                       // Стилизация самого input[type="file"] сложна, часто стилизуют label
                    }}
                />
                 {/* Отображение информации о выбранном файле */}
                 {file && (
                   <div style={{ fontSize: '13px', color: '#6c757d', textAlign: 'left', marginTop: '-10px' }}>
                     Выбран файл: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                   </div>
                 )}


                {/* Кнопка загрузки */}
                <button
                   type="submit"
                   // Кнопка неактивна, если идет загрузка, есть ошибка или файл не выбран
                   disabled={loading || !!error || !file}
                   style={{ // Стилизация кнопки
                      padding: '12px 20px',
                      // Изменение цвета фона в зависимости от состояния disabled
                      backgroundColor: loading || !!error || !file ? '#e9ecef' : '#007bff',
                      color: loading || !!error || !file ? '#adb5bd' : 'white',
                      border: 'none',
                      borderRadius: '5px',
                      // Изменение курсора в зависимости от состояния disabled
                      cursor: loading || !!error || !file ? 'not-allowed' : 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginTop: '20px',
                      transition: 'background-color 0.2s ease', // Плавное изменение цвета фона
                   }}
                   // Простой hover эффект для примера с inline стилями
                   onMouseOver={(e) => { if (!(loading || !!error || !file)) e.target.style.backgroundColor = '#0056b3'; }}
                   onMouseOut={(e) => { if (!(loading || !!error || !file)) e.target.style.backgroundColor = '#007bff'; }}
                >
                    {loading ? 'Идет загрузка...' : 'Загрузить видео'}
                </button>
            </form>
        </div>
     </div>
   );
};

export default Upload;

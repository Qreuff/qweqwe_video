// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VideoPage from './pages/VideoPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import VideoList from './pages/VideoList'; // Если у вас есть отдельная страница списка видео
import Account from './pages/Account';
import Header from './components/Header'; // <-- Импортируем компонент Header
// --- ДОБАВЛЕНО: Импортируем App.css ---
import './App.css';
// --- Конец добавленного импорта ---


function App() {
  return (
    <Router>

      {/* Header рендерится здесь, вне Routes, чтобы отображаться на всех страницах */}
      <Header />

      {/* Основное содержимое страниц рендерится внутри Routes */}
       <div className="page-wrapper"> <Routes> ... </Routes> </div>
        padding-top: [150]px 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        {/* Убедитесь, что маршрут /videolist вам нужен, если главная страница уже показывает список */}
        <Route path="/videolist" element={<VideoList />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage'; // ✅ 추가

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedule/:week" element={<SchedulePage />} /> {/* ✅ 새로운 라우트 추가 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

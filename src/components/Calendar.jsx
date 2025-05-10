// src/components/Calendar.jsx
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

function Calendar({ selectedWeek, setSelectedWeek }) {
  const startOfWeek = dayjs(selectedWeek).startOf('week').add(1, 'day'); // 월요일
  const endOfWeek = startOfWeek.add(6, 'day');
  const navigate = useNavigate();

  const handlePrevWeek = () => {
    setSelectedWeek(dayjs(selectedWeek).subtract(1, 'week').toDate());
  };

  const handleNextWeek = () => {
    setSelectedWeek(dayjs(selectedWeek).add(1, 'week').toDate());
  };

  const moveToSchedulePage = () => {
    const week = startOfWeek.format('YYYY-MM-DD');
    navigate(`/schedule/${week}`);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={handlePrevWeek}>← 이전 주</button>
      <strong style={{ margin: '0 10px' }}>
        {startOfWeek.format('YYYY-MM-DD')} ~ {endOfWeek.format('YYYY-MM-DD')}
      </strong>
      <button onClick={handleNextWeek}>다음 주 →</button>
      <br />
      <button onClick={moveToSchedulePage} style={{ marginTop: '10px' }}>
        이 주의 수업 전용 페이지로 이동 →
      </button>
    </div>
  );
}

export default Calendar;

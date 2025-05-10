import { useState } from 'react';
import StudentList from '../components/StudentList';
import Calendar from '../components/Calendar';

function DashboardPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h2>학생 관리</h2>
        <StudentList />
      </div>
      <div style={{ flex: 2 }}>
        <h2>수업 달력</h2>
        <Calendar selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} />
        {/* ✅ WeeklySchedule은 Dashboard에서 제거됨 */}
      </div>
    </div>
  );
}

export default DashboardPage;

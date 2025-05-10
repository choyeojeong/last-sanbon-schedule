// src/components/AddStudentModal.jsx
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import dayjs from 'dayjs';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
const weekdayToIndex = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };

function AddStudentModal({ onClose }) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('초6');
  const [teacher, setTeacher] = useState('');
  const [startDate, setStartDate] = useState('');
  const [schedule, setSchedule] = useState({});

  const handleTimeChange = (day, value) => {
    setSchedule({ ...schedule, [day]: value });
  };

  const handleSubmit = async () => {
    if (!name || !school || !grade || !teacher || !startDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const { data: inserted, error } = await supabase.from('students').insert([
      {
        name,
        school,
        grade,
        teacher,
        start_date: startDate,
        schedule,
        exit_date: null,
      },
    ]).select();

    if (error) {
      console.error('🧨 Supabase 에러:', error);
      alert('저장에 실패했습니다.');
      return;
    }

    const student = inserted[0];

    // 🔽 수업 자동 생성
    const lessons = [];
    const start = dayjs(startDate);
    const today = dayjs();

    for (let i = 0; i < 10 * 7; i++) {
      const date = start.add(i, 'day');
      const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.day()];
      const time = schedule[dayName];

      if (time && (!student.exit_date || date.isBefore(student.exit_date))) {
        lessons.push({
          student_id: student.id,
          date: date.format('YYYY-MM-DD'),
          time,
          status: '예정',
          make_up: false,
        });
      }
    }

    if (lessons.length > 0) {
      const { error: lessonError } = await supabase.from('lessons').insert(lessons);
      if (lessonError) {
        console.error('🧨 수업 생성 에러:', lessonError);
        alert('수업 생성 중 오류가 발생했습니다.');
      }
    }

    alert('학생이 추가되었습니다.');
    onClose();
  };

  return (
    <div style={modalStyle}>
      <h3>학생 추가</h3>
      <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="학교" value={school} onChange={(e) => setSchool(e.target.value)} />
      <select value={grade} onChange={(e) => setGrade(e.target.value)}>
        {['초6', '중1', '중2', '중3', '고1', '고2', '고3'].map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <input placeholder="담당 선생님" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

      <h4>요일별 수업 시간</h4>
      {weekdays.map((day) => (
        <div key={day}>
          {day}요일: <input placeholder="예: 18:00" onChange={(e) => handleTimeChange(day, e.target.value)} />
        </div>
      ))}

      <br />
      <button onClick={handleSubmit}>저장</button>
      <button onClick={onClose}>닫기</button>
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  top: '10%',
  left: '50%',
  transform: 'translate(-50%, 0)',
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  zIndex: 1000,
  maxHeight: '80vh',
  overflowY: 'auto',
};

export default AddStudentModal;

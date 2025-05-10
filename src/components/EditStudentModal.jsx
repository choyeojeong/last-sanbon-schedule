// src/components/EditStudentModal.jsx
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

function EditStudentModal({ student, onClose }) {
  const [name, setName] = useState(student.name);
  const [school, setSchool] = useState(student.school);
  const [grade, setGrade] = useState(student.grade);
  const [teacher, setTeacher] = useState(student.teacher);
  const [schedule, setSchedule] = useState(student.schedule || {});

  const handleTimeChange = (day, value) => {
    setSchedule({ ...schedule, [day]: value });
  };

  const handleUpdate = async () => {
    if (!name || !school || !grade || !teacher) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const { error } = await supabase
      .from('students')
      .update({
        name,
        school,
        grade,
        teacher,
        schedule,
      })
      .eq('id', student.id);

    if (error) {
      console.error(error);
      alert('수정에 실패했습니다.');
    } else {
      alert('학생 정보가 수정되었습니다.');
      onClose();
    }
  };

  return (
    <div style={modalStyle}>
      <h3>학생 정보 수정</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={school} onChange={(e) => setSchool(e.target.value)} />
      <select value={grade} onChange={(e) => setGrade(e.target.value)}>
        {['초6', '중1', '중2', '중3', '고1', '고2', '고3'].map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <input value={teacher} onChange={(e) => setTeacher(e.target.value)} />

      <h4>요일별 수업 시간</h4>
      {weekdays.map((day) => (
        <div key={day}>
          {day}요일: <input
            value={schedule[day] || ''}
            onChange={(e) => handleTimeChange(day, e.target.value)}
            placeholder="예: 18:00"
          />
        </div>
      ))}

      <br />
      <button onClick={handleUpdate}>저장</button>
      <button onClick={onClose}>닫기</button>
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, 0)',
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  zIndex: 1000,
};

export default EditStudentModal;

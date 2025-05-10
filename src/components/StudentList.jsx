// src/components/StudentList.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .is('exit_date', null) // ✅ 퇴원하지 않은 학생만 불러오기
      .order('name', { ascending: true });

    if (!error) setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (student) => {
    const exitDate = prompt('이 학생의 마지막 수업일을 입력하세요 (예: 2025-05-15)');
    if (!exitDate) return;
    await supabase
      .from('students')
      .update({ exit_date: exitDate })
      .eq('id', student.id);
    alert('학생 퇴원 처리 완료');
    fetchStudents();
  };

  return (
    <div>
      <button onClick={() => setShowAddModal(true)}>학생 추가</button>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>학교</th>
            <th>학년</th>
            <th>담당</th>
            <th>수정</th>
            <th>삭제(퇴원)</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.id}>
              <td>{stu.name}</td>
              <td>{stu.school}</td>
              <td>{stu.grade}</td>
              <td>{stu.teacher}</td>
              <td>
                <button onClick={() => setEditingStudent(stu)}>수정</button>
              </td>
              <td>
                <button onClick={() => handleDelete(stu)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddModal && (
        <AddStudentModal
          onClose={() => {
            setShowAddModal(false);
            fetchStudents();
          }}
        />
      )}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => {
            setEditingStudent(null);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
}

export default StudentList;

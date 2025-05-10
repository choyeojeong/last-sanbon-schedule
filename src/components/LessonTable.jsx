import { useState } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../utils/supabaseClient';

function LessonTable({ date, lessons, refresh }) {
  const [editingId, setEditingId] = useState(null);
  const [reason, setReason] = useState('');
  const [makeUpChoice, setMakeUpChoice] = useState('');
  const [makeUpDate, setMakeUpDate] = useState('');
  const [makeUpTime, setMakeUpTime] = useState('');

  const handleAttendance = async (lesson) => {
    const now = dayjs();
    const endTime = now.add(90, 'minute').format('HH:mm');

    await supabase
      .from('lessons')
      .update({ status: '출석', end_time: endTime })
      .eq('id', lesson.id);

    refresh();
  };

  const handleAbsenceClick = (lesson) => {
    setEditingId(lesson.id);
    setReason('');
    setMakeUpChoice('');
    setMakeUpDate('');
    setMakeUpTime('');
  };

  const handleAbsenceSubmit = async (lesson) => {
    const updates = {
      status: '결석',
      make_up: makeUpChoice === '보강O',
      reason: reason || '',
    };

    if (makeUpChoice === '보강O') {
      if (!makeUpDate || !makeUpTime) {
        alert('보강 날짜와 시간을 입력해주세요.');
        return;
      }

      updates.make_up_date = makeUpDate;
      updates.make_up_time = makeUpTime;

      await supabase.from('lessons').insert([
        {
          student_id: lesson.student_id,
          date: makeUpDate,
          time: makeUpTime,
          status: '예정',
          make_up: true,
          make_up_origin: lesson.id,
        },
      ]);
    }

    const { error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lesson.id);

    if (error) {
      console.error('결석 저장 실패:', error);
      alert('결석 저장 실패! 콘솔을 확인하세요.');
    } else {
      setEditingId(null);
      refresh();
    }
  };

  const handleMoveMakeup = async (lesson) => {
    const newDate = prompt('새 보강 날짜 (예: 2025-05-25)');
    const newTime = prompt('새 보강 시간 (예: 20:00)');
    if (!newDate || !newTime) return;

    await supabase.from('lessons').delete().eq('id', lesson.id);
    await supabase.from('lessons').insert([
      {
        student_id: lesson.student_id,
        date: newDate,
        time: newTime,
        status: '예정',
        make_up: true,
        make_up_origin: lesson.make_up_origin,
      },
    ]);

    alert('보강 일정이 이동되었습니다.');
    refresh();
  };

  const handleMemoChange = async (lesson, value) => {
    await supabase.from('lessons').update({ memo: value }).eq('id', lesson.id);
    refresh();
  };

  const handleDeleteLesson = async (lesson) => {
    const ok = window.confirm('정말 이 수업을 삭제할까요?');
    if (ok) {
      await supabase.from('lessons').delete().eq('id', lesson.id);
      refresh();
    }
  };

  return (
    <div>
      <h4>{dayjs(date).format('MM/DD')} 수업</h4>
      <table>
        <thead>
          <tr>
            <th>시간</th>
            <th>학생</th>
            <th>학교</th>
            <th>학년</th>
            <th>담당</th>
            <th>출결</th>
            <th>메모</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {lessons
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((lesson) => (
              <tr key={lesson.id}>
                <td>{lesson.time}</td>
                <td>{lesson.students?.name}{lesson.make_up && ' (보강)'}</td>
                <td>{lesson.students?.school}</td>
                <td>{lesson.students?.grade}</td>
                <td>{lesson.students?.teacher}</td>
                <td>
                  {editingId === lesson.id ? (
                    <div style={{ textAlign: 'left' }}>
                      <input
                        type="text"
                        placeholder="결석 사유"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <br />
                      <select
                        value={makeUpChoice}
                        onChange={(e) => setMakeUpChoice(e.target.value)}
                      >
                        <option value="">보강 여부 선택</option>
                        <option value="보강O">보강O</option>
                        <option value="보강X">보강X</option>
                      </select>
                      <br />
                      {makeUpChoice === '보강O' && (
                        <>
                          <input
                            type="date"
                            value={makeUpDate}
                            onChange={(e) => setMakeUpDate(e.target.value)}
                          />
                          <input
                            type="time"
                            value={makeUpTime}
                            onChange={(e) => setMakeUpTime(e.target.value)}
                          />
                          <br />
                        </>
                      )}
                      <button onClick={() => handleAbsenceSubmit(lesson)}>저장</button>
                    </div>
                  ) : lesson.status === '출석' ? (
                    <>
                      ✅ 출석
                      {lesson.end_time && (
                        <div style={{ fontSize: '0.8em', color: '#333' }}>
                          (~ {lesson.end_time})
                        </div>
                      )}
                    </>
                  ) : lesson.status === '결석' ? (
                    <>
                      ❌ 결석
                      {lesson.reason && (
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                          사유: {lesson.reason}
                        </div>
                      )}
                      {lesson.make_up === false && (
                        <div style={{ fontSize: '0.8em', color: '#999' }}>보강X</div>
                      )}
                      {lesson.make_up_date && lesson.make_up_time && (
                        <div style={{ fontSize: '0.8em' }}>
                          보강 예정: {lesson.make_up_date} {lesson.make_up_time}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <button className="attend" onClick={() => handleAttendance(lesson)}>
                        출석
                      </button>
                      <button className="absent" onClick={() => handleAbsenceClick(lesson)}>
                        결석
                      </button>
                    </>
                  )}
                  {lesson.make_up && (
                    <div>
                      <button className="makeup" onClick={() => handleMoveMakeup(lesson)}>
                        보강 이동
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    value={lesson.memo || ''}
                    onChange={(e) => handleMemoChange(lesson, e.target.value)}
                    placeholder="메모 입력"
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <button style={{ color: 'red' }} onClick={() => handleDeleteLesson(lesson)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default LessonTable;

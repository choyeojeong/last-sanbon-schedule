import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import dayjs from 'dayjs';
import LessonTable from '../components/LessonTable';

function SchedulePage() {
  const { week } = useParams();
  const [lessons, setLessons] = useState([]);

  const fetchLessons = async () => {
    const start = dayjs(week);
    const end = start.add(6, 'day');

    const { data, error } = await supabase
      .from('lessons')
      .select('*, students!inner(*)') // join + 필터링
      .gte('date', start.format('YYYY-MM-DD'))
      .lte('date', end.format('YYYY-MM-DD'))
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (!error) {
      // 필터: 퇴원일이 없거나, 수업날짜가 퇴원일 이전인 경우만 표시
      const filtered = data.filter(lesson =>
        !lesson.students?.exit_date || lesson.date <= lesson.students.exit_date
      );
      setLessons(filtered);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [week]);

  const grouped = lessons.reduce((acc, lesson) => {
    const date = lesson.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(lesson);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px' }}>
      <h2>{week} 주간 수업 리스트</h2>
      {Object.keys(grouped)
        .sort()
        .map((date) => (
          <LessonTable
            key={date}
            date={date}
            lessons={grouped[date]}
            refresh={fetchLessons}
          />
        ))}
    </div>
  );
}

export default SchedulePage;

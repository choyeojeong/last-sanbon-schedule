import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../utils/supabaseClient';
import LessonTable from './LessonTable';

function WeeklySchedule({ selectedWeek }) {
  const [lessons, setLessons] = useState([]);

  const fetchLessons = async () => {
    const start = dayjs(selectedWeek).startOf('week').add(1, 'day').format('YYYY-MM-DD');
    const end = dayjs(selectedWeek).endOf('week').add(1, 'day').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('lessons')
      .select('*, students!inner(*)')
      .gte('date', start)
      .lte('date', end)
      .order('time', { ascending: true });

    if (!error) {
      const filtered = data.filter(lesson =>
        !lesson.students?.exit_date || lesson.date <= lesson.students.exit_date
      );
      setLessons(filtered);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [selectedWeek]);

  const grouped = lessons.reduce((acc, lesson) => {
    const date = lesson.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(lesson);
    return acc;
  }, {});

  return (
    <div>
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

export default WeeklySchedule;

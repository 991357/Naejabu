import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ko';
import { useRouter } from 'next/navigation';

moment.locale('ko');
const localizer = momentLocalizer(moment);

// Define types
type Resume = {
  id: string;
  company_name: string;
  deadline: string;
  created_at: string;
};

type CalendarViewProps = {
  resumes: Resume[];
};

type EventType = 'deadline' | 'created_at';

const CalendarView = ({ resumes }: CalendarViewProps) => {
  const router = useRouter();
  const [eventType, setEventType] = useState<EventType>('deadline');
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);

  const events = useMemo(() => {
    return resumes.map(resume => ({
      id: resume.id,
      title: resume.company_name,
      start: new Date(eventType === 'deadline' ? resume.deadline : resume.created_at),
      end: new Date(eventType === 'deadline' ? resume.deadline : resume.created_at),
      allDay: true,
    }));
  }, [resumes, eventType]);

  const handleSelectEvent = (event: { id: string }) => {
    router.push(`/resumes/${event.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-[70vh]">
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <span className="text-sm font-medium mr-2 dark:text-gray-300">표시 기준:</span>
            <button 
                onClick={() => setEventType('deadline')}
                className={`px-3 py-1 text-sm rounded-md ${eventType === 'deadline' ? 'bg-accent text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'}`}>
                마감일
            </button>
            <button 
                onClick={() => setEventType('created_at')}
                className={`px-3 py-1 text-sm rounded-md ${eventType === 'created_at' ? 'bg-accent text-white shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300'}`}>
                생성일
            </button>
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        messages={{
            next: "다음",
            previous: "이전",
            today: "오늘",
            month: "월",
            week: "주",
            day: "일",
            agenda: "목록",
            date: "날짜",
            time: "시간",
            event: "일정",
            noEventsInRange: "이 범위에 표시할 일정이 없습니다.",
        }}
        onSelectEvent={handleSelectEvent}
        onNavigate={(newDate) => setDate(newDate)}
        date={date}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        view={view}
        onView={(newView) => setView(newView)}
      />
      <style jsx global>{`
        .dark .rbc-toolbar {
            color: #e5e7eb; /* gray-200 */
        }
        .dark .rbc-toolbar button {
            color: #e5e7eb; /* gray-200 */
        }
        .dark .rbc-toolbar button:hover, .dark .rbc-toolbar button:focus {
            background-color: #374151; /* gray-700 */
            color: #e5e7eb;
        }
        .dark .rbc-toolbar .rbc-active {
            background-color: #4f46e5; /* accent */
            color: white;
        }
        .dark .rbc-off-range-bg {
            background: #1f2937; /* gray-800 */
        }
        .dark .rbc-today {
            background-color: #374151; /* gray-700 */
        }
        .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view, .dark .rbc-agenda-table {
            background-color: #111827; /* gray-900 */
            color: #e5e7eb; /* gray-200 */
            border: 1px solid #374151; /* gray-700 */
        }
        .dark .rbc-header {
            border-bottom: 1px solid #374151; /* gray-700 */
        }
        .dark .rbc-day-bg, .dark .rbc-month-row, .dark .rbc-agenda-table tbody tr, .dark .rbc-time-header-content, .dark .rbc-time-slot {
            border-color: #374151; /* gray-700 */
        }
        .dark .rbc-event {
            background-color: #4f46e5; /* accent */
            color: white;
        }
        .dark .rbc-event.rbc-selected {
            background-color: #4338ca; /* darker accent */
        }
        .dark .rbc-show-more {
            color: #a5b4fc; /* lighter accent */
        }
        .dark .rbc-agenda-date-cell, .dark .rbc-agenda-time-cell {
            color: #d1d5db; /* gray-300 */
        }
    `}</style>
    </div>
  );
};

export default CalendarView;

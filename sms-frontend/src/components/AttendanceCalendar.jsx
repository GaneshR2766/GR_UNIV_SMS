import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarTailwind.css';
import Attendances from '../pages/Attendances';

function AttendanceCalendar() {
  const [attendances, setAttendances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const orangeFilter = {
  filter: 'brightness(0) saturate(100%) invert(61%) sepia(91%) saturate(1232%) hue-rotate(331deg) brightness(96%) contrast(91%)'
};
  const fetchAttendances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/attendance");
      const data = await response.json();
      setAttendances(data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);

  const availableDates = new Set(
    attendances.map((a) => new Date(a.date).toDateString())
  );

  const tileDisabled = ({ date, view }) =>
    view === 'month' && !availableDates.has(date.toDateString());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-500 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 inline-flex items-center px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50 shadow">
  <div className="mr-2" style={orangeFilter}>
    <img src="/calendar.png" alt="Calendar" className="h-7 w-7" />
  </div>
  Attendance Calendar
</h1>

      <div className="calendar-container max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm border border-white/30 dark:border-gray-700/50 p-4">
        <Calendar
          onChange={handleDateChange}
          tileDisabled={tileDisabled}
          value={selectedDate}
          className="bg-transparent border-none"
        />
      </div>

      {isLoading ? (
        <div className="mt-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl border border-white/30 dark:border-gray-700/50 text-center">
          Loading attendance data...
        </div>
      ) : (
        <div className="mt-6">
          <Attendances
            attendances={attendances}
            selectedDate={selectedDate}
            onUpdate={fetchAttendances}
          />
        </div>
      )}
    </div>
  );
}

export default AttendanceCalendar;

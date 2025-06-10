'use client';

export default function WeeklyDaySelector({ eventData, onUpdate }) {
  const days = [
    { index: 0, short: 'S', full: 'Sunday' },
    { index: 1, short: 'M', full: 'Monday' },
    { index: 2, short: 'T', full: 'Tuesday' },
    { index: 3, short: 'W', full: 'Wednesday' },
    { index: 4, short: 'T', full: 'Thursday' },
    { index: 5, short: 'F', full: 'Friday' },
    { index: 6, short: 'S', full: 'Saturday' }
  ];

  const toggleDay = (dayIndex) => {
    const currentDays = eventData.weeklyDays || [];
    const newDays = currentDays.includes(dayIndex) 
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex].sort();
    onUpdate({ weeklyDays: newDays });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Repeat on days</label>
      <div className="flex gap-2">
        {days.map((day) => (
          <button
            key={day.index}
            type="button"
            onClick={() => toggleDay(day.index)}
            className={`w-10 h-10 rounded-full text-sm font-medium border-2 transition-all ${
              (eventData.weeklyDays || []).includes(day.index)
                ? 'bg-emerald-400 text-white border-emerald-400'
                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-500'
            }`}
            title={day.full}
          >
            {day.short}
          </button>
        ))}
      </div>
    </div>
  );
}

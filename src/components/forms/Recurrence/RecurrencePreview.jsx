'use client';

export default function RecurrencePreview({ eventData }) {
  const getRecurrenceDescription = () => {
    if (!eventData.isRecurring) return '';
    const { 
      recurrencePattern, 
      recurrenceCount = 1, 
      weeklyDays = [],
      monthlyOption = 'date',
      monthlyWeekday = 0, 
      monthlyWeekdayOrdinal = 0,
      yearlyMonth = 0,
      recurrenceInterval = 1
    } = eventData;
    
    let description = 'Repeats ';
    const intervalText = recurrenceInterval > 1 ? `every ${recurrenceInterval} ` : '';
    
    switch (recurrencePattern) {
      case 'daily':
        description += `${intervalText}${recurrenceInterval === 1 ? 'daily' : 'days'}`;
        break;
      case 'weekly':
        if (weeklyDays.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = weeklyDays.sort((a, b) => a - b).map(day => dayNames[day]).join(', ');
          description += `${intervalText}${recurrenceInterval === 1 ? 'weekly' : 'weeks'} on ${selectedDays}`;
        } else {
          description += `${intervalText}${recurrenceInterval === 1 ? 'weekly' : 'weeks'}`;
        }
        break;
      case 'monthly':
        if (monthlyOption === 'date') {
          description += `${intervalText}${recurrenceInterval === 1 ? 'monthly' : 'months'} on the same date`;
        } else if (monthlyOption === 'weekday') {
          const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'last'];
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          description += `${intervalText}${recurrenceInterval === 1 ? 'monthly' : 'months'} on the ${ordinals[monthlyWeekdayOrdinal]} ${weekdays[monthlyWeekday]}`;
        }
        break;
      case 'yearly':
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (yearlyMonth !== undefined && yearlyMonth >= 0) {
          description += `${intervalText}${recurrenceInterval === 1 ? 'yearly' : 'years'} in ${months[yearlyMonth]}`;
        } else {
          description += `${intervalText}${recurrenceInterval === 1 ? 'yearly' : 'years'}`;
        }
        break;
      default:
        description = '';
    }
    
    if (recurrenceCount > 1) {
      description += ` for ${recurrenceCount} occurrence${recurrenceCount > 1 ? 's' : ''}`;
    }
    return description;
  };

  const description = getRecurrenceDescription();
  
  if (!description) return null;

  return (
    <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4">
      <p className="text-sm text-emerald-800 font-medium">{description}</p>
    </div>
  );
}

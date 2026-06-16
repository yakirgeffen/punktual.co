'use client';

export default function RecurrencePreview({ eventData }) {
  const getRecurrenceDescription = () => {
    if (!eventData.isRecurring) return '';

    const {
      recurrencePattern,
      recurrenceCount,
      recurrenceEndDate,
      weeklyDays = [],
      monthlyOption = 'date',
      monthlyWeekday = 0,
      monthlyWeekdayOrdinal = 0,
      yearlyMonth = 0,
      recurrenceInterval = 1,
    } = eventData;

    const intervalText = recurrenceInterval > 1 ? `every ${recurrenceInterval} ` : '';
    let base = '';

    switch (recurrencePattern) {
      case 'daily':
        base = `${intervalText}${recurrenceInterval === 1 ? 'daily' : 'days'}`;
        break;

      case 'weekly': {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const freq = `${intervalText}${recurrenceInterval === 1 ? 'weekly' : 'weeks'}`;
        if (weeklyDays.length > 0) {
          const selectedDays = weeklyDays
            .slice()
            .sort((a, b) => a - b)
            .map((day) => dayNames[day])
            .join(', ');
          base = `${freq} on ${selectedDays}`;
        } else {
          base = freq;
        }
        break;
      }

      case 'monthly': {
        const freq = `${intervalText}${recurrenceInterval === 1 ? 'monthly' : 'months'}`;
        if (monthlyOption === 'weekday') {
          const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'last'];
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          base = `${freq} on the ${ordinals[monthlyWeekdayOrdinal]} ${weekdays[monthlyWeekday]}`;
        } else {
          base = `${freq} on the same date`;
        }
        break;
      }

      case 'yearly': {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ];
        const freq = `${intervalText}${recurrenceInterval === 1 ? 'yearly' : 'years'}`;
        base =
          yearlyMonth !== undefined && yearlyMonth >= 0
            ? `${freq} in ${months[yearlyMonth]}`
            : freq;
        break;
      }

      default:
        return '';
    }

    // Append end condition — count takes priority over end date when both are set.
    if (recurrenceCount && recurrenceCount > 1) {
      return `Repeats ${base}, ${recurrenceCount} times.`;
    }
    if (recurrenceEndDate) {
      // Format the date in a readable way without importing a library.
      try {
        const d = new Date(recurrenceEndDate + 'T00:00:00');
        const formatted = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return `Repeats ${base}, until ${formatted}.`;
      } catch {
        return `Repeats ${base}, until ${recurrenceEndDate}.`;
      }
    }

    return `Repeats ${base}.`;
  };

  const description = getRecurrenceDescription();

  if (!description) return null;

  return (
    <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4">
      <p className="text-sm text-emerald-800 font-medium">{description}</p>
      <p className="text-xs text-emerald-700 mt-1">
        Repeats are supported by Google Calendar and Apple/.ics downloads. Outlook and Yahoo links add the first occurrence only.
      </p>
    </div>
  );
}

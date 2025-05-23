// src/lib/calendarGenerator.js
export function generateCalendarCode(eventData, buttonData) {
  // Simple version for now
  const buttonColor = buttonData?.colorScheme || '#4D90FF'
  const buttonText = buttonData?.textColor || '#FFFFFF'
  
  return `<button style="background-color: ${buttonColor}; color: ${buttonText}; padding: 10px 16px; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif;">Add to Calendar</button>`
}
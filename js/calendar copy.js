export function getDaysInMonth(year, month) {
  const daysCount = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysCount }, (_, index) => {
    const day = index + 1;

    return {
      day,
      dateKey: formatDateKey(year, month, day),
    };
  });
}

export function formatDateKey(year, month, day) {
  const normalizedMonth = String(month + 1).padStart(2, '0');
  const normalizedDay = String(day).padStart(2, '0');

  return `${year}-${normalizedMonth}-${normalizedDay}`;
}
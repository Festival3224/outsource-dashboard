export function formatDateKey(year, month, day) {
  const normalizedMonth = String(month + 1).padStart(2, '0');
  const normalizedDay = String(day).padStart(2, '0');

  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

export function getMonthLabel(year, month) {
  return new Date(year, month).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getWeekdayLabels() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

export function getCalendarCells(year, month) {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let index = 0; index < firstDayIndex; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const weekDay = date.getDay();

    cells.push({
      day,
      dateKey: formatDateKey(year, month, day),
      isWeekend: weekDay === 0 || weekDay === 6,
    });
  }

  return cells;
}

export function getWorkingDaysStats(year, month, vacationDays = []) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let totalWorkingDays = 0;
  let remainingWorkingDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const weekDay = date.getDay();
    const isWeekend = weekDay === 0 || weekDay === 6;
    const dateKey = formatDateKey(year, month, day);

    if (!isWeekend) {
      totalWorkingDays += 1;

      if (!vacationDays.includes(dateKey)) {
        remainingWorkingDays += 1;
      }
    }
  }

  return {
    totalWorkingDays,
    remainingWorkingDays,
  };
}

export function formatVacationDays(vacationDays = []) {
  if (vacationDays.length === 0) {
    return '—';
  }

  return vacationDays
    .map((dateKey) => {
      const [, month, day] = dateKey.split('-');
      return `${day}.${month}`;
    })
    .join(', ');
}
import { state } from './state.js';
import { saveData } from './storage.js';

export function getMonthKey(year, month) {
  return `${year}-${month}`;
}

export function getCurrentMonthKey() {
  return getMonthKey(state.currentYear, state.currentMonth);
}

export function getCurrentMonthData() {
  const monthKey = getCurrentMonthKey();

  if (!state.monthlyData[monthKey]) {
    state.monthlyData[monthKey] = {
      employees: [],
      projects: [],
    };

    saveData();
  }

  return state.monthlyData[monthKey];
}

export function seedCurrentMonthData() {
  const monthData = getCurrentMonthData();

  monthData.employees = [
    {
      id: crypto.randomUUID(),
      name: 'Anna',
      surname: 'Smith',
      dateOfBirth: '1995-04-12',
      position: 'Frontend Developer',
      salary: 3000,
      assignments: [],
      vacationDays: [],
    },
    {
      id: crypto.randomUUID(),
      name: 'John',
      surname: 'Brown',
      dateOfBirth: '1988-09-25',
      position: 'Backend Developer',
      salary: 3800,
      assignments: [],
      vacationDays: [],
    },
    {
      id: crypto.randomUUID(),
      name: 'Maria',
      surname: 'Garcia',
      dateOfBirth: '1992-01-18',
      position: 'Project Manager',
      salary: 4200,
      assignments: [],
      vacationDays: [],
    },
  ];

  monthData.projects = [
    {
      id: crypto.randomUUID(),
      companyName: 'Acme Ltd',
      projectName: 'CRM Platform',
      budget: 12000,
      capacity: 3,
    },
    {
      id: crypto.randomUUID(),
      companyName: 'Bright Studio',
      projectName: 'Marketing Website',
      budget: 6500,
      capacity: 2,
    },
  ];

  saveData();
}

export function deleteEmployee(employeeId) {
  const monthData = getCurrentMonthData();

  monthData.employees = monthData.employees.filter((employee) => (
    employee.id !== employeeId
  ));

  saveData();
}
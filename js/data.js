import { state } from './state.js';
import { saveData } from './storage.js';
import {
  canAssignEmployeeToProject,
  canUpdateEmployeeAssignment,
} from './calculations.js';

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

export function addEmployee(employeeData) {
  const monthData = getCurrentMonthData();

  monthData.employees.push({
    id: crypto.randomUUID(),
    name: employeeData.name,
    surname: employeeData.surname,
    dateOfBirth: employeeData.dateOfBirth,
    position: employeeData.position,
    salary: Number(employeeData.salary),
    assignments: [],
    vacationDays: [],
  });

  saveData();
}

export function addProject(projectData) {
  const monthData = getCurrentMonthData();

  monthData.projects.push({
    id: crypto.randomUUID(),
    companyName: projectData.companyName,
    projectName: projectData.projectName,
    budget: Number(projectData.budget),
    capacity: Number(projectData.capacity),
  });

  saveData();
}

export function deleteProject(projectId) {
  const monthData = getCurrentMonthData();

  monthData.projects = monthData.projects.filter((project) => (
    project.id !== projectId
  ));

  saveData();
}

export function assignEmployeeToProject(employeeId, projectId) {
  const monthData = getCurrentMonthData();
  const employee = monthData.employees.find((item) => item.id === employeeId);
  const project = monthData.projects.find((item) => item.id === projectId);

  if (!employee || !project) {
    return false;
  }

  const alreadyAssigned = employee.assignments.some((assignment) => (
    assignment.projectId === projectId
  ));

  if (alreadyAssigned) {
    return false;
  }

  if (!canAssignEmployeeToProject(employee, project, monthData.employees, 1)) {
    return false;
  }

  employee.assignments.push({
    projectId,
    capacity: 1,
    fit: 1,
  });

  saveData();

  return true;
}

export function unassignEmployeeFromProject(employeeId, projectId) {
  const monthData = getCurrentMonthData();
  const employee = monthData.employees.find((item) => item.id === employeeId);

  if (!employee) {
    return;
  }

  employee.assignments = employee.assignments.filter((assignment) => (
    assignment.projectId !== projectId
  ));

  saveData();
}

export function updateEmployeeAssignment(employeeId, projectId, assignmentData) {
  const monthData = getCurrentMonthData();
  const employee = monthData.employees.find((item) => item.id === employeeId);
  const project = monthData.projects.find((item) => item.id === projectId);

  if (!employee || !project) {
    return false;
  }

  const assignment = employee.assignments.find((item) => (
    item.projectId === projectId
  ));

  if (!assignment) {
    return false;
  }

  const capacity = Number(assignmentData.capacity);
  const fit = Number(assignmentData.fit);

  if (
    Number.isNaN(capacity)
    || Number.isNaN(fit)
    || capacity <= 0
    || fit < 0
    || fit > 1
  ) {
    return false;
  }

  if (!canUpdateEmployeeAssignment(employee, project, monthData.employees, capacity)) {
    return false;
  }

  assignment.capacity = capacity;
  assignment.fit = fit;

  saveData();

  return true;
}
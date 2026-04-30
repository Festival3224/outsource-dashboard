import { state } from './state.js';
import { getCurrentMonthData } from './data.js';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth()
      && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function formatCurrency(value) {
  return `€${Number(value).toFixed(2)}`;
}

export function renderMonthSelect() {
  const monthSelect = document.querySelector('#month-select');

  monthSelect.innerHTML = MONTHS.map((month, index) => `
    <option value="${index}" ${index === state.currentMonth ? 'selected' : ''}>
      ${month}
    </option>
  `).join('');
}

export function renderYearSelect() {
  const yearSelect = document.querySelector('#year-select');
  const currentYear = new Date().getFullYear();

  const years = [];

  for (let year = currentYear - 2; year <= currentYear + 2; year += 1) {
    years.push(year);
  }

  yearSelect.innerHTML = years.map((year) => `
    <option value="${year}" ${year === state.currentYear ? 'selected' : ''}>
      ${year}
    </option>
  `).join('');
}

function renderEmployeesTable(employees) {
  if (employees.length === 0) {
    return '<p>No employees yet.</p>';
  }

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Surname</th>
          <th>Age</th>
          <th>Position</th>
          <th>Salary</th>
          <th>Estimated Payment</th>
          <th>Project</th>
          <th>Projected Income</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        ${employees.map((employee) => `
          <tr>
            <td>${employee.name}</td>
            <td>${employee.surname}</td>
            <td>${getAge(employee.dateOfBirth)}</td>
            <td>${employee.position}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td>${formatCurrency(0)}</td>
            <td>
              <button class="table-button">
                Show Assignments (${employee.assignments.length})
              </button>
            </td>
            <td>${formatCurrency(0)}</td>
            <td>
              <button class="table-button danger" data-delete-employee-id="${employee.id}">
                Delete
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderProjectsTable(projects) {
  if (projects.length === 0) {
    return '<p>No projects yet.</p>';
  }

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Company Name</th>
          <th>Project Name</th>
          <th>Budget</th>
          <th>Employee Capacity</th>
          <th>Employees</th>
          <th>Estimated Income</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        ${projects.map((project) => `
          <tr>
            <td>${project.companyName}</td>
            <td>${project.projectName}</td>
            <td>${formatCurrency(project.budget)}</td>
            <td>0/${project.capacity}</td>
            <td>
              <button class="table-button">
                Show Employees (0)
              </button>
            </td>
            <td>${formatCurrency(0)}</td>
            <td>
              <button class="table-button danger">
                Delete
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

export function renderContent() {
  const content = document.querySelector('#content');
  const monthData = getCurrentMonthData();

  const title = state.currentView === 'projects' ? 'Projects' : 'Employees';
  const addButtonText = state.currentView === 'projects'
    ? '+ Add Project'
    : '+ Add Employee';

  const table = state.currentView === 'employees'
    ? renderEmployeesTable(monthData.employees)
    : renderProjectsTable(monthData.projects);

  content.innerHTML = `
    <div class="content-header">
      <div>
        <h2>${title}</h2>
        <p>
          Current period:
          <strong>${MONTHS[state.currentMonth]} ${state.currentYear}</strong>
        </p>
      </div>

      <button class="primary-button">
        ${addButtonText}
      </button>
    </div>

    ${table}
  `;
}

export function renderApp() {
  renderMonthSelect();
  renderYearSelect();
  renderContent();
}
import { state } from './state.js';
import {
  loadData,
  saveCurrentView,
  loadCurrentView,
} from './storage.js';

import {
  getCurrentMonthData,
  seedCurrentMonthData,
  deleteEmployee,
  addEmployee,
} from './data.js';

import { renderApp } from './render.js';

function setActiveTab() {
  const projectsTab = document.querySelector('#projects-tab');
  const employeesTab = document.querySelector('#employees-tab');

  projectsTab.classList.toggle('active', state.currentView === 'projects');
  employeesTab.classList.toggle('active', state.currentView === 'employees');
}

function initEventListeners() {
  const monthSelect = document.querySelector('#month-select');
  const yearSelect = document.querySelector('#year-select');
  const projectsTab = document.querySelector('#projects-tab');
  const employeesTab = document.querySelector('#employees-tab');
  const seedButton = document.querySelector('#seed-button');
  const content = document.querySelector('#content');

  const employeeModal = document.querySelector('#employee-modal');
  const employeeForm = document.querySelector('#employee-form');
  const employeeModalClose = document.querySelector('#employee-modal-close');
  const employeeFormCancel = document.querySelector('#employee-form-cancel');
  const employeeSubmit = document.querySelector('#employee-submit');

  const touchedFields = new Set();

  function getEmployeeFormData() {
    const formData = new FormData(employeeForm);

    return {
      name: formData.get('name').trim(),
      surname: formData.get('surname').trim(),
      dateOfBirth: formData.get('dateOfBirth'),
      position: formData.get('position'),
      salary: formData.get('salary'),
    };
  }

  function validateEmployeeForm(showAllErrors = false) {
    const formData = getEmployeeFormData();
    const errors = {};
    const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;

    if (formData.name.length < 3 || !nameRegex.test(formData.name)) {
      errors.name = 'Name must be at least 3 characters and contain only letters';
    }

    if (formData.surname.length < 3 || !nameRegex.test(formData.surname)) {
      errors.surname = 'Surname must be at least 3 characters and contain only letters';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of Birth is required';
    }

    if (!formData.position) {
      errors.position = 'Position is required';
    }

    if (!formData.salary || Number(formData.salary) <= 0) {
      errors.salary = 'Salary must be greater than 0';
    }

    employeeForm.querySelectorAll('[data-error]').forEach((errorElement) => {
      const fieldName = errorElement.dataset.error;
      const shouldShowError = showAllErrors || touchedFields.has(fieldName);

      errorElement.textContent = shouldShowError ? errors[fieldName] || '' : '';
    });

    employeeSubmit.disabled = Object.keys(errors).length > 0;

    return Object.keys(errors).length === 0;
  }

  function closeEmployeePanel() {
    employeeModal.classList.add('hidden');
    employeeForm.reset();
    touchedFields.clear();
    validateEmployeeForm();
  }

  content.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-employee-id]');
    const addEmployeeButton = event.target.closest('[data-add-employee]');

    if (addEmployeeButton && state.currentView === 'employees') {
      touchedFields.clear();
      employeeForm.reset();
      validateEmployeeForm();
      employeeModal.classList.remove('hidden');
      return;
    }

    if (!deleteButton) {
      return;
    }

    const employeeId = deleteButton.dataset.deleteEmployeeId;

    deleteEmployee(employeeId);
    renderApp();
  });

  employeeModalClose.addEventListener('click', closeEmployeePanel);
  employeeFormCancel.addEventListener('click', closeEmployeePanel);

  employeeModal.addEventListener('click', (event) => {
    if (event.target === employeeModal) {
        event.stopPropagation();
    }
  });

  employeeForm.addEventListener('input', (event) => {
    // touchedFields.add(event.target.name);
    validateEmployeeForm();
  });

  employeeForm.addEventListener('blur', (event) => {
    touchedFields.add(event.target.name);
    validateEmployeeForm();
  }, true);

  employeeForm.addEventListener('change', (event) => {
    touchedFields.add(event.target.name);
    validateEmployeeForm();
  });

  employeeForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
  });

  employeeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateEmployeeForm(true)) {
      return;
    }

    const formData = getEmployeeFormData();

    addEmployee(formData);
    closeEmployeePanel();
    renderApp();
  });

  monthSelect.addEventListener('change', (event) => {
    state.currentMonth = Number(event.target.value);
    getCurrentMonthData();
    renderApp();
  });

  yearSelect.addEventListener('change', (event) => {
    state.currentYear = Number(event.target.value);
    getCurrentMonthData();
    renderApp();
  });

  projectsTab.addEventListener('click', () => {
    state.currentView = 'projects';
    saveCurrentView();
    setActiveTab();
    renderApp();
  });

  employeesTab.addEventListener('click', () => {
    state.currentView = 'employees';
    saveCurrentView();
    setActiveTab();
    renderApp();
  });

  seedButton.addEventListener('click', () => {
    seedCurrentMonthData();
    renderApp();
  });
}

function initApp() {
  loadData();
  loadCurrentView();
  getCurrentMonthData();
  renderApp();
  setActiveTab();
  initEventListeners();

  console.log('App initialized');
  console.log(state);
}

initApp();
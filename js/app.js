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
  addProject,
  deleteProject,
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

  const projectModal = document.querySelector('#project-modal');
  const projectForm = document.querySelector('#project-form');
  const projectModalClose = document.querySelector('#project-modal-close');
  const projectFormCancel = document.querySelector('#project-form-cancel');
  const projectSubmit = document.querySelector('#project-submit');

  const touchedEmployeeFields = new Set();
  const touchedProjectFields = new Set();

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

  function getProjectFormData() {
    const formData = new FormData(projectForm);

    return {
      projectName: formData.get('projectName').trim(),
      companyName: formData.get('companyName').trim(),
      budget: formData.get('budget'),
      capacity: formData.get('capacity'),
    };
  }

  function validateEmployeeForm(showAllErrors = false) {
    const data = getEmployeeFormData();
    const errors = {};
    const nameRegex = /^[A-Za-zА-Яа-яЁё]+$/;

    if (data.name.length < 3 || !nameRegex.test(data.name)) {
      errors.name = 'Name must be at least 3 characters and contain only letters';
    }

    if (data.surname.length < 3 || !nameRegex.test(data.surname)) {
      errors.surname = 'Surname must be at least 3 characters and contain only letters';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of Birth is required';
    }

    if (!data.position) {
      errors.position = 'Position is required';
    }

    if (!data.salary || Number(data.salary) <= 0) {
      errors.salary = 'Salary must be greater than 0';
    }

    employeeForm.querySelectorAll('[data-error]').forEach((errorElement) => {
      const fieldName = errorElement.dataset.error;
      const shouldShowError = showAllErrors || touchedEmployeeFields.has(fieldName);

      errorElement.textContent = shouldShowError ? errors[fieldName] || '' : '';
    });

    employeeSubmit.disabled = Object.keys(errors).length > 0;

    return Object.keys(errors).length === 0;
  }

  function validateProjectForm(showAllErrors = false) {
    const data = getProjectFormData();
    const errors = {};

    if (data.projectName.length < 3) {
      errors.projectName = 'Project name must be at least 3 characters';
    }

    if (data.companyName.length < 2) {
      errors.companyName = 'Company name must be at least 2 characters';
    }

    if (!data.budget || Number(data.budget) <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }

    if (!data.capacity || Number(data.capacity) < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }

    projectForm.querySelectorAll('[data-error]').forEach((errorElement) => {
      const fieldName = errorElement.dataset.error;
      const shouldShowError = showAllErrors || touchedProjectFields.has(fieldName);

      errorElement.textContent = shouldShowError ? errors[fieldName] || '' : '';
    });

    projectSubmit.disabled = Object.keys(errors).length > 0;

    return Object.keys(errors).length === 0;
  }

  function closeEmployeePanel() {
    employeeModal.classList.add('hidden');
    employeeForm.reset();
    touchedEmployeeFields.clear();
    validateEmployeeForm();
  }

  function closeProjectPanel() {
    projectModal.classList.add('hidden');
    projectForm.reset();
    touchedProjectFields.clear();
    validateProjectForm();
  }

  content.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-employee-id]');
    const deleteProjectButton = event.target.closest('[data-delete-project-id]');
    const addEmployeeButton = event.target.closest('[data-add-employee]');
    const addProjectButton = event.target.closest('[data-add-project]');

    if (addEmployeeButton && state.currentView === 'employees') {
      touchedEmployeeFields.clear();
      employeeForm.reset();
      validateEmployeeForm();
      employeeModal.classList.remove('hidden');
      return;
    }

    if (addProjectButton && state.currentView === 'projects') {
      touchedProjectFields.clear();
      projectForm.reset();
      validateProjectForm();
      projectModal.classList.remove('hidden');
      return;
    }

      if (deleteProjectButton) {
          const projectId = deleteProjectButton.dataset.deleteProjectId;

          deleteProject(projectId);
          renderApp();
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

  employeeForm.addEventListener('input', () => {
    validateEmployeeForm();
  });

  employeeForm.addEventListener('blur', (event) => {
    touchedEmployeeFields.add(event.target.name);
    validateEmployeeForm();
  }, true);

  employeeForm.addEventListener('change', (event) => {
    touchedEmployeeFields.add(event.target.name);
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

    addEmployee(getEmployeeFormData());
    closeEmployeePanel();
    renderApp();
  });

  projectModalClose.addEventListener('click', closeProjectPanel);
  projectFormCancel.addEventListener('click', closeProjectPanel);

  projectModal.addEventListener('click', (event) => {
    if (event.target === projectModal) {
      event.stopPropagation();
    }
  });

  projectForm.addEventListener('input', () => {
    validateProjectForm();
  });

  projectForm.addEventListener('blur', (event) => {
    touchedProjectFields.add(event.target.name);
    validateProjectForm();
  }, true);

  projectForm.addEventListener('change', (event) => {
    touchedProjectFields.add(event.target.name);
    validateProjectForm();
  });

  projectForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });

  projectForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateProjectForm(true)) {
      return;
    }

    addProject(getProjectFormData());
    closeProjectPanel();
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
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
  assignEmployeeToProject,
  unassignEmployeeFromProject,
  updateEmployeeAssignment,
} from './data.js';

import { renderApp } from './render.js';

import {
  MAX_EMPLOYEE_CAPACITY,
  getEmployeeCapacity,
  getAssignmentEffectiveCapacity,
  formatCapacity,
} from './calculations.js';

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

  const projectEmployeesModal = document.querySelector('#project-employees-modal');
  const projectEmployeesClose = document.querySelector('#project-employees-close');
  const projectEmployeesTitle = document.querySelector('#project-employees-title');
  const projectEmployeesBody = document.querySelector('#project-employees-body');

  const employeeAssignmentsModal = document.querySelector('#employee-assignments-modal');
  const employeeAssignmentsClose = document.querySelector('#employee-assignments-close');
  const employeeAssignmentsTitle = document.querySelector('#employee-assignments-title');
  const employeeAssignmentsBody = document.querySelector('#employee-assignments-body');

  const assignPopup = document.querySelector('#assign-popup');
  const assignForm = document.querySelector('#assign-form');
  const assignPopupTitle = document.querySelector('#assign-popup-title');
  const assignPopupInfo = document.querySelector('#assign-popup-info');
  const assignProjectSelect = document.querySelector('#assign-project-select');
  const assignSubmit = document.querySelector('#assign-submit');
  const assignCancel = document.querySelector('#assign-cancel');

  const editAssignmentPopup = document.querySelector('#edit-assignment-popup');
  const editAssignmentForm = document.querySelector('#edit-assignment-form');
  const editAssignmentTitle = document.querySelector('#edit-assignment-title');
  const editAssignmentInfo = document.querySelector('#edit-assignment-info');
  const editAssignmentCancel = document.querySelector('#edit-assignment-cancel');

  const touchedEmployeeFields = new Set();
  const touchedProjectFields = new Set();

  /* function getEmployeeCapacity(employee) {
    return employee.assignments.reduce((sum, assignment) => (
      sum + Number(assignment.capacity || 0)
    ), 0);
  } */

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

  function resetForm(form, touchedFields, validateForm) {
    form.reset();
    touchedFields.clear();
    validateForm();
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
    resetForm(employeeForm, touchedEmployeeFields, validateEmployeeForm);
  }

  function closeProjectPanel() {
    projectModal.classList.add('hidden');
    resetForm(projectForm, touchedProjectFields, validateProjectForm);
  }

  function closeInfoModal(modal, titleElement, defaultTitle, bodyElement) {
    modal.classList.add('hidden');
    titleElement.textContent = defaultTitle;
    bodyElement.innerHTML = '';
  }

  function closeProjectEmployeesModal() {
    closeInfoModal(
      projectEmployeesModal,
      projectEmployeesTitle,
      'Employees on Project',
      projectEmployeesBody
    );
  }

  function openProjectEmployeesModal(projectId) {
    const monthData = getCurrentMonthData();
    const project = monthData.projects.find((item) => item.id === projectId);

    if (!project) {
      return;
    }

    const assignedEmployees = monthData.employees.filter((employee) => (
      employee.assignments.some((assignment) => assignment.projectId === projectId)
    ));

    projectEmployeesTitle.textContent = `Employees on ${project.projectName}`;

    if (assignedEmployees.length === 0) {
      projectEmployeesBody.innerHTML = '<p>No employees assigned to this project yet.</p>';
    } else {
      projectEmployeesBody.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Capacity</th>
              <th>Fit</th>
              <th>Vacation</th>
              <th>Effective</th>
              <th>Revenue</th>
              <th>Cost</th>
              <th>Profit</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            ${assignedEmployees.map((employee) => {
              const assignment = employee.assignments.find((item) => (
                item.projectId === projectId
              ));

              const effectiveCapacity = getAssignmentEffectiveCapacity(assignment);

              return `
                <tr>
                  <td>${employee.name} ${employee.surname}</td>
                  <td>${assignment.capacity ?? '-'}</td>
                  <td>${assignment.fit ?? '-'}</td>
                  <td>-</td>
                  <td>${formatCapacity(effectiveCapacity)}</td>
                  <td>€0.00</td>
                  <td>€0.00</td>
                  <td>€0.00</td>
                  <td>
                    <button
                       class="table-button"
                       data-edit-assignment-employee-id="${employee.id}"
                       data-edit-assignment-project-id="${projectId}" 
                    >
                      Edit
                    </button>

                    <button
                        class="table-button danger"
                        data-unassign-employee-id="${employee.id}"
                        data-unassign-project-id="${projectId}"
                    >
                        Unassign
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    projectEmployeesModal.classList.remove('hidden');
  }

  function closeEmployeeAssignmentsModal() {
      closeInfoModal(
        employeeAssignmentsModal,
        employeeAssignmentsTitle,
        'Employee Assignments',
        employeeAssignmentsBody
      );
  }

function openEmployeeAssignmentsModal(employeeId) {
  const monthData = getCurrentMonthData();
  const employee = monthData.employees.find((item) => item.id === employeeId);

  if (!employee) {
    return;
  }

  employeeAssignmentsTitle.textContent = `Assignments for ${employee.name} ${employee.surname}`;

  if (employee.assignments.length === 0) {
    employeeAssignmentsBody.innerHTML = '<p>This employee has no assignments yet.</p>';
  } else {
    employeeAssignmentsBody.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Company</th>
            <th>Capacity</th>
            <th>Fit</th>
            <th>Effective</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${employee.assignments.map((assignment) => {
            const project = monthData.projects.find((item) => (
              item.id === assignment.projectId
            ));

            const effectiveCapacity = getAssignmentEffectiveCapacity(assignment);

            return `
              <tr>
                <td>${project?.projectName ?? 'Deleted project'}</td>
                <td>${project?.companyName ?? '-'}</td>
                <td>${assignment.capacity ?? '-'}</td>
                <td>${assignment.fit ?? '-'}</td>
                <td>${formatCapacity(effectiveCapacity)}</td>
                <td>
                  <button
                    class="table-button"
                    data-edit-assignment-employee-id="${employee.id}"
                    data-edit-assignment-project-id="${assignment.projectId}"
                  >
                    Edit
                  </button>

                  <button
                    class="table-button danger"
                    data-unassign-employee-id="${employee.id}"
                    data-unassign-project-id="${assignment.projectId}"
                  >
                    Unassign
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  employeeAssignmentsModal.classList.remove('hidden');
}


  function closeAssignPopup() {
    assignPopup.classList.add('hidden');
    assignForm.reset();
    assignSubmit.disabled = true;
  }

  function openAssignPopup(employeeId, buttonElement) {
    const monthData = getCurrentMonthData();
    const employee = monthData.employees.find((item) => item.id === employeeId);

    if (!employee) {
      return;
    }

    const currentCapacity = getEmployeeCapacity(employee);
    const availableCapacity = MAX_EMPLOYEE_CAPACITY - currentCapacity;

    assignForm.dataset.employeeId = employeeId;

    assignPopupTitle.textContent = `Assign ${employee.name} ${employee.surname}`;

    assignPopupInfo.innerHTML = `
      <p>
        <strong>Current Capacity:</strong>
        ${formatCapacity(currentCapacity)} / ${formatCapacity(MAX_EMPLOYEE_CAPACITY)}
      </p>
      <p>
        <strong>Available:</strong>
        ${formatCapacity(availableCapacity)}
      </p>
    `;

    assignProjectSelect.innerHTML = `
      <option value="">Select a project</option>
      ${monthData.projects.map((project) => `
        <option value="${project.id}">
          ${project.projectName}
        </option>
      `).join('')}
    `;

    assignSubmit.disabled = true;

    const rect = buttonElement.getBoundingClientRect();

    assignPopup.style.top = `${rect.bottom + window.scrollY + 8}px`;
    assignPopup.style.left = `${rect.left + window.scrollX - 260}px`;

    assignPopup.classList.remove('hidden');
  }


function closeEditAssignmentPopup() {
  editAssignmentPopup.classList.add('hidden');
  editAssignmentForm.reset();
  delete editAssignmentForm.dataset.employeeId;
  delete editAssignmentForm.dataset.projectId;
}

function openEditAssignmentPopup(employeeId, projectId, buttonElement) {
  const monthData = getCurrentMonthData();
  const employee = monthData.employees.find((item) => item.id === employeeId);
  const project = monthData.projects.find((item) => item.id === projectId);

  if (!employee || !project) {
    return;
  }

  const assignment = employee.assignments.find((item) => (
    item.projectId === projectId
  ));

  if (!assignment) {
    return;
  }

  editAssignmentForm.dataset.employeeId = employeeId;
  editAssignmentForm.dataset.projectId = projectId;

  editAssignmentTitle.textContent = `Edit ${employee.name} ${employee.surname}`;
  editAssignmentInfo.innerHTML = `
    <p><strong>Project:</strong> ${project.projectName}</p>
    <p><strong>Company:</strong> ${project.companyName}</p>
  `;

  editAssignmentForm.elements.capacity.value = assignment.capacity;
  editAssignmentForm.elements.fit.value = assignment.fit;

  const rect = buttonElement.getBoundingClientRect();

  editAssignmentPopup.style.top = `${rect.bottom + window.scrollY + 8}px`;
  editAssignmentPopup.style.left = `${rect.left + window.scrollX - 260}px`;

  editAssignmentPopup.classList.remove('hidden');
}


  content.addEventListener('click', (event) => {
    const deleteEmployeeButton = event.target.closest('[data-delete-employee-id]');
    const deleteProjectButton = event.target.closest('[data-delete-project-id]');
    const addEmployeeButton = event.target.closest('[data-add-employee]');
    const addProjectButton = event.target.closest('[data-add-project]');
    const showProjectEmployeesButton = event.target.closest('[data-show-project-employees-id]');
    const assignEmployeeButton = event.target.closest('[data-assign-employee-id]');
    const showEmployeeAssignmentsButton = event.target.closest('[data-show-employee-assignments-id]');

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

    if (showProjectEmployeesButton) {
      openProjectEmployeesModal(showProjectEmployeesButton.dataset.showProjectEmployeesId);
      return;
    }

    if (showEmployeeAssignmentsButton) {
      openEmployeeAssignmentsModal(showEmployeeAssignmentsButton.dataset.showEmployeeAssignmentsId);
      return;
    }

    if (assignEmployeeButton) {
      openAssignPopup(assignEmployeeButton.dataset.assignEmployeeId, assignEmployeeButton);
      return;
    }

    if (deleteProjectButton) {
      deleteProject(deleteProjectButton.dataset.deleteProjectId);
      renderApp();
      return;
    }

    if (deleteEmployeeButton) {
      deleteEmployee(deleteEmployeeButton.dataset.deleteEmployeeId);
      renderApp();
    }
  });

  employeeModalClose.addEventListener('click', closeEmployeePanel);
  employeeFormCancel.addEventListener('click', closeEmployeePanel);

  employeeModal.addEventListener('click', (event) => {
    if (event.target === employeeModal) {
      event.stopPropagation();
    }
  });

  employeeForm.addEventListener('input', validateEmployeeForm);

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

  projectForm.addEventListener('input', validateProjectForm);

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

  projectEmployeesClose.addEventListener('click', closeProjectEmployeesModal);

  projectEmployeesModal.addEventListener('click', (event) => {
    if (event.target === projectEmployeesModal) {
      event.stopPropagation();
    }
  });

  employeeAssignmentsClose.addEventListener('click', closeEmployeeAssignmentsModal);

  employeeAssignmentsModal.addEventListener('click', (event) => {
    if (event.target === employeeAssignmentsModal) {
      event.stopPropagation();
    }
  });

  projectEmployeesBody.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-assignment-employee-id]');

    if (editButton) {
      openEditAssignmentPopup(
        editButton.dataset.editAssignmentEmployeeId,
        editButton.dataset.editAssignmentProjectId,
        editButton
      );
      return;
    }

    const unassignButton = event.target.closest('[data-unassign-employee-id]');

    if (!unassignButton) {
      return;
    }

    const employeeId = unassignButton.dataset.unassignEmployeeId;
    const projectId = unassignButton.dataset.unassignProjectId;

    unassignEmployeeFromProject(employeeId, projectId);
    openProjectEmployeesModal(projectId);
    renderApp();
  });

  employeeAssignmentsBody.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-assignment-employee-id]');

    if (editButton) {
      openEditAssignmentPopup(
        editButton.dataset.editAssignmentEmployeeId,
        editButton.dataset.editAssignmentProjectId,
        editButton
      );
      return;
    }

    const unassignButton = event.target.closest('[data-unassign-employee-id]');

    if (!unassignButton) {
      return;
    }

    const employeeId = unassignButton.dataset.unassignEmployeeId;
    const projectId = unassignButton.dataset.unassignProjectId;

    unassignEmployeeFromProject(employeeId, projectId);
    openEmployeeAssignmentsModal(employeeId);
    renderApp();
  });

  assignProjectSelect.addEventListener('change', () => {
    assignSubmit.disabled = !assignProjectSelect.value;
  });

  assignCancel.addEventListener('click', closeAssignPopup);

  assignForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });

  assignForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const employeeId = assignForm.dataset.employeeId;
    const projectId = assignProjectSelect.value;

    if (!employeeId || !projectId) {
        return;
    }

    assignEmployeeToProject(employeeId, projectId);

    closeAssignPopup();
    renderApp();
  });


  editAssignmentCancel.addEventListener('click', closeEditAssignmentPopup);

  editAssignmentForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });

  editAssignmentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const employeeId = editAssignmentForm.dataset.employeeId;
    const projectId = editAssignmentForm.dataset.projectId;

    const formData = new FormData(editAssignmentForm);
    const capacity = Number(formData.get('capacity'));
    const fit = Number(formData.get('fit'));

    if (!employeeId || !projectId) {
      return;
    }

    if (capacity <= 0 || capacity > 1.5 || fit < 0 || fit > 1) {
      return;
    }

    updateEmployeeAssignment(employeeId, projectId, {
      capacity,
      fit,
    });

    closeEditAssignmentPopup();

    if (!projectEmployeesModal.classList.contains('hidden')) {
      openProjectEmployeesModal(projectId);
    }

    if (!employeeAssignmentsModal.classList.contains('hidden')) {
      openEmployeeAssignmentsModal(employeeId);
    }

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
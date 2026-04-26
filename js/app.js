import { state } from './state.js';
import { loadData } from './storage.js';
import { getCurrentMonthData, seedCurrentMonthData } from './data.js';
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
    setActiveTab();
    renderApp();
  });

  employeesTab.addEventListener('click', () => {
    state.currentView = 'employees';
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
  getCurrentMonthData();
  renderApp();
  setActiveTab();
  initEventListeners();

  console.log('App initialized');
  console.log(state);
}

initApp();
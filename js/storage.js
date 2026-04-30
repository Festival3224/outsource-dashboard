import { state } from './state.js';

const STORAGE_KEY = 'monthlyData';
const VIEW_KEY = 'currentView';


export function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.monthlyData));
}

export function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);

  state.monthlyData = data ? JSON.parse(data) : {};
}


export function saveCurrentView() {
  localStorage.setItem(VIEW_KEY, state.currentView);
}

export function loadCurrentView() {
  const savedView = localStorage.getItem(VIEW_KEY);

  if (savedView === 'projects' || savedView === 'employees') {
    state.currentView = savedView;
  }
}
import { state } from './state.js';

const STORAGE_KEY = 'monthlyData';

export function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.monthlyData));
}

export function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);

  state.monthlyData = data ? JSON.parse(data) : {};
}
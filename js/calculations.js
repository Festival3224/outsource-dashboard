export const MAX_EMPLOYEE_CAPACITY = 1.5;

export function getEmployeeCapacity(employee) {
  return employee.assignments.reduce((sum, assignment) => (
    sum + Number(assignment.capacity || 0)
  ), 0);
}

export function getProjectAssignedCapacity(projectId, employees) {
  return employees.reduce((sum, employee) => {
    const assignment = employee.assignments.find((item) => (
      item.projectId === projectId
    ));

    return sum + Number(assignment?.capacity || 0);
  }, 0);
}

export function getAssignmentEffectiveCapacity(assignment) {
  return Number(assignment.capacity || 0) * Number(assignment.fit || 0);
}

export function formatCapacity(value) {
  return Number(value).toFixed(1);
}

export function getAssignmentCost(employee, assignment) {
  return Number(employee.salary || 0) * Number(assignment.capacity || 0);
}

export function getAssignmentRevenue(project, assignment) {
  const projectCapacity = Number(project.capacity || 0);

  if (projectCapacity === 0) {
    return 0;
  }

  return Number(project.budget || 0)
    * (Number(assignment.capacity || 0) / projectCapacity);
}

export function getAssignmentProfit(employee, project, assignment) {
  const revenue = getAssignmentRevenue(project, assignment);
  const cost = getAssignmentCost(employee, assignment);

  return revenue - cost;
}

export function getEmployeeEstimatedPayment(employee) {
  return employee.assignments.reduce((sum, assignment) => (
    sum + getAssignmentCost(employee, assignment)
  ), 0);
}

export function getEmployeeProjectedIncome(employee, projects) {
  return employee.assignments.reduce((sum, assignment) => {
    const project = projects.find((item) => item.id === assignment.projectId);

    if (!project) {
      return sum;
    }

    return sum + getAssignmentRevenue(project, assignment);
  }, 0);
}

export function getProjectEstimatedIncome(project, employees) {
  return employees.reduce((sum, employee) => {
    const assignment = employee.assignments.find((item) => (
      item.projectId === project.id
    ));

    if (!assignment) {
      return sum;
    }

    return sum + getAssignmentRevenue(project, assignment);
  }, 0);
}

export function getProjectCost(project, employees) {
  return employees.reduce((sum, employee) => {
    const assignment = employee.assignments.find((item) => (
      item.projectId === project.id
    ));

    if (!assignment) {
      return sum;
    }

    return sum + getAssignmentCost(employee, assignment);
  }, 0);
}

export function getProjectProfit(project, employees) {
  return getProjectEstimatedIncome(project, employees)
    - getProjectCost(project, employees);
}
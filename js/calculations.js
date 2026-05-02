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
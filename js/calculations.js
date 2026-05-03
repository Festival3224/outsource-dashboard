export const MAX_EMPLOYEE_CAPACITY = 1.5;

export function getEmployeeCapacity(employee) {
  return employee.assignments.reduce((sum, assignment) => (
    sum + Number(assignment.capacity || 0)
  ), 0);
}

export function getProjectAssignedCapacity(projectId, employees, year, month) {
  return employees.reduce((sum, employee) => {
    const assignment = employee.assignments.find((item) => (
      item.projectId === projectId
    ));

    if (!assignment) {
      return sum;
    }

    return sum + getAssignmentEffectiveCapacity(employee, assignment, year, month);
  }, 0);
}

export function getAssignmentEffectiveCapacity(employee, assignment, year, month) {
  const vacationCoefficient = getVacationCoefficient(employee, year, month);

  return Number(assignment.capacity || 0)
    * Number(assignment.fit || 0)
    * vacationCoefficient;
}

export function formatCapacity(value) {
  return Number(value).toFixed(1);
}

export function getAssignmentCost(employee, assignment) {
  const payableCapacity = Math.max(0.5, Number(assignment.capacity || 0));

  return Number(employee.salary || 0) * payableCapacity;
}

export function getAssignmentRevenue(project, employees, employee, assignment, year, month) {
  const totalEffectiveCapacity = getProjectAssignedCapacity(
    project.id,
    employees,
    year,
    month
  );

  const capacityForRevenue = Math.max(
    Number(project.capacity || 0),
    totalEffectiveCapacity
  );

  if (capacityForRevenue === 0) {
    return 0;
  }

  const revenuePerEffectiveCapacity = Number(project.budget || 0) / capacityForRevenue;
  const assignmentEffectiveCapacity = getAssignmentEffectiveCapacity(
    employee,
    assignment,
    year,
    month
  );

  return revenuePerEffectiveCapacity * assignmentEffectiveCapacity;
}

export function getAssignmentProfit(project, employees, employee, assignment, year, month) {
  const revenue = getAssignmentRevenue(project, employees, employee, assignment, year, month);
  const cost = getAssignmentCost(employee, assignment);

  return revenue - cost;
}

export function getEmployeeEstimatedPayment(employee) {
  if (employee.assignments.length === 0) {
    return Number(employee.salary || 0) * 0.5;
  }

  return employee.assignments.reduce((sum, assignment) => (
    sum + getAssignmentCost(employee, assignment)
  ), 0);
}

export function getEmployeeProjectedIncome(employee, projects, employees, year, month) {
  return employee.assignments.reduce((sum, assignment) => {
    const project = projects.find((item) => item.id === assignment.projectId);

    if (!project) {
      return sum;
    }

    return sum + getAssignmentProfit(project, employees, employee, assignment, year, month);
  }, 0);
}

export function getProjectEstimatedIncome(project, employees, year, month) {
  const projectRevenue = employees.reduce((sum, employee) => {
    const assignment = employee.assignments.find((item) => (
      item.projectId === project.id
    ));

    if (!assignment) {
      return sum;
    }

    return sum + getAssignmentRevenue(project, employees, employee, assignment, year, month);
  }, 0);

  const projectCost = getProjectCost(project, employees);

  return projectRevenue - projectCost;
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

export function getProjectProfit(project, employees, year, month) {
  return getProjectEstimatedIncome(project, employees, year, month);
}

export function getEmployeeAvailableCapacity(employee, excludeProjectId = null) {
  const usedCapacity = employee.assignments.reduce((sum, assignment) => {
    if (assignment.projectId === excludeProjectId) {
      return sum;
    }

    return sum + Number(assignment.capacity || 0);
  }, 0);

  return MAX_EMPLOYEE_CAPACITY - usedCapacity;
}

export function getProjectAvailableCapacity(project, employees, excludeEmployeeId = null) {
  const usedCapacity = employees.reduce((sum, employee) => {
    if (employee.id === excludeEmployeeId) {
      return sum;
    }

    const assignment = employee.assignments.find((item) => (
      item.projectId === project.id
    ));

    return sum + Number(assignment?.capacity || 0);
  }, 0);

  return Number(project.capacity || 0) - usedCapacity;
}

export function canAssignEmployeeToProject(employee, project, employees, capacity = 1) {
  const employeeAvailableCapacity = getEmployeeAvailableCapacity(employee);
  const projectAvailableCapacity = getProjectAvailableCapacity(project, employees);

  return Number(capacity) <= employeeAvailableCapacity
    && Number(capacity) <= projectAvailableCapacity;
}

export function canUpdateEmployeeAssignment(employee, project, employees, capacity) {
  const employeeAvailableCapacity = getEmployeeAvailableCapacity(employee, project.id);
  const projectAvailableCapacity = getProjectAvailableCapacity(project, employees, employee.id);

  return Number(capacity) <= employeeAvailableCapacity
    && Number(capacity) <= projectAvailableCapacity;
}

export function getVacationCoefficient(employee, year, month) {
  const vacationDays = employee.vacationDays || [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let totalWorkingDays = 0;
  let vacationWorkingDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const weekDay = date.getDay();
    const isWeekend = weekDay === 0 || weekDay === 6;

    if (isWeekend) {
      continue;
    }

    totalWorkingDays += 1;

    const normalizedMonth = String(month + 1).padStart(2, '0');
    const normalizedDay = String(day).padStart(2, '0');
    const dateKey = `${year}-${normalizedMonth}-${normalizedDay}`;

    if (vacationDays.includes(dateKey)) {
      vacationWorkingDays += 1;
    }
  }

  if (totalWorkingDays === 0) {
    return 1;
  }

  return (totalWorkingDays - vacationWorkingDays) / totalWorkingDays;
}
# Outsource Dashboard

Outsource Dashboard is an application for managing employees, projects, assignments, capacity, vacations, and financial metrics across monthly snapshots.

The application was built as part of the RS School JavaScript/Frontend course task.

## Deploy

[Live Demo](https://festival3224.github.io/outsource-dashboard/)

## Repository

[GitHub Repository](https://github.com/Festival3224/outsource-dashboard)

## Features

### Monthly Data Management

- Data is stored by month and year.
- Each month has its own independent employees and projects data.
- The selected view is saved between page reloads.
- Data is persisted in `localStorage`.
- The application includes initial sample data with 3 employees and 2 projects.
- Full Seed Data functionality from the task specification is planned:
  - open a popup with months that already contain data;
  - show the number of employees, projects, and total estimated income for each available month;
  - copy data from a selected source month to the current month;
  - clear vacation days during copying because vacation days are month-specific.

### Employees

- Add new employees through a slide-in panel.
- Validate employee form fields.
- Validate that an employee is at least 18 years old.
- Delete employees.
- Display employee age, position, salary, estimated payment, capacity, vacation days, assignments count, and projected income.
- Disable assignment when an employee reaches maximum capacity.

### Projects

- Add new projects through a slide-in panel.
- Validate project form fields.
- Delete projects.
- Clean related assignments when a project is deleted.
- Display project budget, employee capacity, assigned employees count, and estimated income.

### Assignments

- Assign employees to projects.
- Select project, capacity, and fit during assignment.
- Prevent over-allocation of employees and projects.
- Edit assignment capacity and fit.
- Unassign employees from projects.
- Show assignments for a selected employee.
- Show employees assigned to a selected project.

### Availability and Vacation

- Open an availability calendar for each employee.
- Select vacation days for the current month.
- Display working days and selected vacation days.
- Save vacation days to monthly employee data.
- Recalculate effective capacity and financial metrics after vacation changes.

### Financial Calculations

The application calculates:

- Employee capacity.
- Project assigned capacity.
- Vacation coefficient.
- Effective capacity.
- Assignment revenue.
- Assignment cost.
- Assignment profit.
- Employee estimated payment.
- Employee projected income.
- Project estimated income.

Current effective capacity formula:

`effectiveCapacity = capacity * fit * vacationCoefficient`

Current vacation coefficient formula:

`vacationCoefficient = workingDaysWithoutVacation / totalWorkingDays`

Current assignment cost formula:

`cost = employeeSalary * Math.max(0.5, assignmentCapacity)`

Current assignment revenue logic is based on effective capacity and project budget distribution.

## Project Structure

```txt
outsource-dashboard/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── storage.js
│   ├── state.js
│   ├── render.js
│   ├── calculations.js
│   └── calendar.js
└── README.md
```


## Main Modules

### state.js

### storage.js

### data.js

### render.js

### calculations.js

### calendar.js

### app.js

Initializes the application and manages event listeners.

## Current Status

Implemented:

- Monthly data structure
- LocalStorage persistence
- Employees and Projects views
- Initial sample data
- Add Employee
- Add Project
- Delete Employee
- Delete Project with assignment cleanup
- Assign employee to project
- Assign capacity and fit
- Edit assignment
- Unassign employee
- Show project employees
- Show employee assignments
- Capacity calculations
- Vacation calendar
- Vacation coefficient
- Effective capacity
- Financial calculations
- Over-allocation protection
- Basic validation

Planned improvements:

- Full Seed Data feature: copy employees and projects from another month and clear vacation days during copying
- Unassign confirmation popup with financial details
- Inline editing for employee position and salary
- Total estimated income below projects table
- Sorting
- Filtering
- Sidebar collapse
- Better popup positioning within viewport
- Additional UI polish


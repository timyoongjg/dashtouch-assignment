# Task Management Application

A React application for managing tasks with Redux.

## Features

- Display tasks in a table format
- Show task details (ID, title, status, deadline)
- Toggle task status between "pending" and "completed"
- Filter tasks by status
- Sort tasks by deadline
- Add new tasks

## Technologies Used

- React
- Redux (@reduxjs/toolkit and react-redux)
- React Hook Form
- TypeScript
- Jest and React Testing Library

## Getting Started

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

The application will start at http://localhost:3000.

### Running Tests

```bash
npm test
```

## Project Structure

- `src/features/tasks/tasksSlice.ts`: Redux slice for tasks with reducers and selectors
- `src/features/tasks/components/`: React components for task display and manipulation
- `src/features/tasks/tests/`: Tests for the tasks feature

## Sample Data

The application comes with the following sample task data:

```json
[
  { "id": 1, "title": "Fix login bug", "status": "pending", "deadline": "2025-05-10" },
  { "id": 2, "title": "Write unit tests", "status": "completed", "deadline": "2025-06-01" },
  { "id": 3, "title": "Update README documentation", "status": "pending", "deadline": "2025-04-15" },
  { "id": 4, "title": "Design new user profile page", "status": "pending", "deadline": "2025-04-01" }
]
``` 
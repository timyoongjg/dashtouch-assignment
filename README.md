# Enhanced Task Management Application

A comprehensive React application for managing tasks with advanced features.

## Features

### Task Display and Organization
- Display tasks in a responsive table format
- Show task details including ID, title, status, and deadline
- Toggle task status between "pending" and "completed" with visual feedback
- Sort tasks by ID, title, status, or deadline
- Filter tasks by status (all, pending, completed)
- Search tasks by title

### Task Management
- Complete CRUD operations for tasks (Create, Read, Update, Delete)
- Form validation with user feedback
- Edit existing tasks with pre-populated form

### Deadline Features
- Color-coded tasks based on deadline proximity
  - Red: Overdue tasks
  - Orange: Tasks due within 3 days
  - Yellow: Tasks due within 7 days
- Display days remaining until deadline
- Deadline sorting options
- Visual indicators for overdue tasks

### Persistent Storage
- Local storage persistence to maintain tasks between sessions

### Responsive Design
- Mobile-friendly interface that adapts to different screen sizes
- Responsive tables with horizontal scrolling on small screens
- Optimized button and control layouts for mobile devices

## Technologies Used

- React
- Redux (@reduxjs/toolkit and react-redux)
- React Hook Form for form handling and validation
- TypeScript for type safety
- Jest and React Testing Library for comprehensive testing
- CSS for responsive styling

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

- `src/features/tasks/tasksSlice.ts`: Redux slice for tasks with reducers, selectors, and local storage persistence
- `src/features/tasks/components/`: React components for task display and manipulation
  - TaskList: Main component displaying the task list with filtering and sorting
  - TaskItem: Component for individual task display with actions
  - TaskForm: Form component for adding and editing tasks
- `src/features/tasks/tests/`: Tests for the tasks feature

## Key Implementation Details

1. **Redux Store**: Uses Redux Toolkit for efficient state management
2. **Form Handling**: Implements React Hook Form for validation and form state management
3. **Local Storage**: Persists tasks to browser's local storage
4. **Responsive Design**: Adapts to various screen sizes using media queries
5. **Type Safety**: Comprehensive TypeScript types throughout the application
6. **Testing**: Comprehensive test coverage for components and state management

## Sample Data

The application comes with sample task data that is used when no existing tasks are found in local storage:

```json
[
  { "id": 1, "title": "Fix login bug", "status": "pending", "deadline": "2025-05-10" },
  { "id": 2, "title": "Write unit tests", "status": "completed", "deadline": "2025-06-01" },
  { "id": 3, "title": "Update README documentation", "status": "pending", "deadline": "2025-04-15" },
  { "id": 4, "title": "Design new user profile page", "status": "pending", "deadline": "2025-04-01" }
]
``` 
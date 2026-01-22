# Testing Guide for Medical AI Diagnosis System

This repository contains a comprehensive testing suite comprising Backend Unit/Integration tests, Frontend Component tests, and End-to-End (E2E) system tests.

## 1. Backend Testing

The backend is tested using **Pytest**. Tests cover models, API routes, services (including AI mocks), security, and performance.

### Prerequisites
- Python 3.x
- Virtual environment with test dependencies (`pytest`, `httpx`, `mongomock`, etc.)

### Setup & Execution
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Activate the Test Virtual Environment:**
   *Note: We utilize a specific virtual environment for testing to ensure all dev-dependencies are present.*
   ```bash
   source venv_test/bin/activate
   ```

3. **Run Tests:**
   ```bash
   # Run the entire test suite
   pytest

   # Run with verbose output
   pytest -v

   # Run specific test categories
   pytest tests/test_models.py       # Unit Tests (Models)
   pytest tests/test_routes.py       # Integration Tests (API Endpoints)
   pytest tests/test_ai_safety.py    # AI Safety & Disclaimer Checks
   pytest tests/test_security.py     # Security (RBAC) & Performance Checks
   ```

## 2. Frontend Testing

The frontend is tested using **Jest** and **React Testing Library**. Tests focus on component rendering, user interactions, and state management.

### Execution
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Run Tests:**
   ```bash
   # Run all tests
   npm test

   # Run in watch mode (interactive)
   npm run test:watch
   ```

## 3. End-to-Ene (E2E) Testing

End-to-End tests are performed using **Cypress**. These tests verify the full application flow (e.g., Login -> Book Appointment).

### Prerequisites
**Critical:** The application servers MUST be running for E2E tests to work.

1. **Start Backend Server** (Terminal 1):
   ```bash
   cd backend
   source .venv/bin/activate
   python app.py
   ```
   *Ensure it runs on port 5000.*

2. **Start Frontend Server** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   *Ensure it runs on port 3000.*

### Execution
1. **Navigate to the frontend directory** (Terminal 3):
   ```bash
   cd frontend
   ```

2. **Run Cypress:**
   ```bash
   # Headless Mode (Command Line only - Best for CI)
   npm run test:e2e

   # Interactive Mode (Opens Cypress App - Best for Debugging)
   npm run test:e2e:open
   ```

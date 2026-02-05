# Finaurial Project Setup Instructions

This document provides instructions on how to set up and run the Finaurial project on a new machine.

## Prerequisites

*   Node.js (LTS version recommended)
*   npm (usually comes with Node.js)
*   Git

## Setup Steps

1.  **Clone the Repository:**
    Open your terminal or command prompt and run the following command to clone the project from GitHub:
    ```bash
    git clone <YOUR_GITHUB_REPOSITORY_URL_HERE>
    cd finaurial
    ```
    **Note:** Replace `<YOUR_GITHUB_REPOSITORY_URL_HERE>` with the actual URL of your GitHub repository.

2.  **Install Frontend Dependencies:**
    Navigate to the project's root directory and install the frontend dependencies:
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    Navigate into the `backend` directory and install its dependencies:
    ```bash
    cd backend
    npm install
    cd ..
    ```

4.  **Run the Frontend:**
    From the project's root directory, start the React development server:
    ```bash
    npm start
    ```
    This will open the application in your browser at `http://localhost:3000`.

5.  **Run the Backend (Note: Backend API endpoints are not yet implemented):**
    Open a **new terminal window** and navigate to the `backend` directory. Then run the backend server:
    ```bash
    cd backend
    node server.js
    ```
    Currently, the backend only provides a basic server structure, and API endpoints are not yet fully implemented.

## Development Conventions

*   **Frontend:**
    *   The frontend is built with React and uses functional components with hooks.
    *   Styling is done with Tailwind CSS.
    *   Routing is handled by React Router.
    *   The application uses local storage to manage authentication.
*   **Backend:**
    *   The backend is a Node.js application with an Express.js server.
    *   It follows a standard structure with `controllers`, `models`, and `routes`.
    *   The database models are defined but not yet connected to a database.
    *   The API routes are defined but not yet implemented.

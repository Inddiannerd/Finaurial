# Project: Finaurial

## Project Overview

Finaurial is a financial management application built with the MERN stack (MongoDB, Express.js, React, Node.js) and styled with Tailwind CSS. It allows users to track their income and expenses, manage budgets, and view financial reports. The application features a dashboard for a financial overview, forms for adding transactions and budgets, and a reports page. The frontend is a single-page application built with React and React Router. The backend is set up with a standard Node.js structure, but the API endpoints are not yet implemented.

## Building and Running

To get the application running, you will need to have Node.js and npm installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Frontend:**
    ```bash
    npm start
    ```
    This will start the React development server and open the application in your browser at `http://localhost:3000`.

3.  **Build the Frontend:**
    ```bash
    npm run build
    ```
    This will create a production build of the frontend in the `build` directory.

4.  **Run the Backend:**
    The backend is not yet implemented. To run the backend, you would typically run a command like:
    ```bash
    node backend/server.js
    ```
    However, since the backend is not implemented, this command will not do anything.

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

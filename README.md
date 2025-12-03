# YakeeN

YakeeN is a web application built with React, Vite, and Firebase. It appears to be a platform for users to post and discover opportunities.

## Features

*   **User Authentication:** Sign up, sign in, and user verification.
*   **Opportunity Management:**
    *   Create and post new opportunities.
    *   View a list of all available opportunities.
    *   View detailed information for a specific opportunity.
    *   View and manage user's own postings.
*   **Trust Score:** A system to calculate a user's trust score.
*   **Location-based services:** Likely uses location to filter or display opportunities.

## Technologies Used

*   **Frontend:**
    *   [React](https://react.dev/)
    *   [Vite](https://vitejs.dev/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [React Router](https://reactrouter.com/) for client-side routing.
    *   [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons.
*   **Backend (BaaS):**
    *   [Firebase](https://firebase.google.com/) for authentication and database.
*   **Development:**
    *   [ESLint](https://eslint.org/) for code linting.
    *   [Axios](https://axios-http.com/) for making HTTP requests.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Aditya-Nagurkar/Yakeen.git
    cd Yakeen
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

*   `npm run build`: Builds the app for production to the `dist` folder.

*   `npm run lint`: Lints the source code for potential errors.

*   `npm run preview`: Serves the production build locally.

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, etc.
│   ├── components/      # Reusable React components
│   ├── config/          # Firebase configuration
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API calls and business logic
│   └── utils/           # Utility functions
├── .env                 # Environment variables (needs to be created)
├── package.json
└── README.md

```

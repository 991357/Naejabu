# Naejabu - Resume Management Service

## Description

Naejabu is a web application for managing resumes. Users can create, edit, and store their resumes. It also provides a spell-checking feature to help users create professional resumes.

## Features

*   **User Authentication**: Secure login and registration system.
*   **Resume Management**: Create, view, edit, and delete resumes.
*   **Trash**: Deleted resumes are moved to the trash and can be restored or permanently deleted.
*   **Spell Check**: Integrated spell checking for resume content.
*   **Multiple Views**: View resumes in a list, grid, or calendar view.

## Getting Started

### Prerequisites

*   Node.js
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/991357/Naejabu.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd Naejabu/naejabu-app
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

*   **Frontend**:
    *   Next.js
    *   React
    *   TypeScript
    *   Tailwind CSS
*   **Backend**:
    *   Next.js API Routes
    *   better-sqlite3 (for database)
    *   jsonwebtoken (for authentication)
    *   bcryptjs (for password hashing)
    *   nodemailer (for sending emails)
*   **Spell Check**:
    *   hanspell

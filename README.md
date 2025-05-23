# Football Cards Application

## Overview
The Football Cards application is a web platform that allows users to browse and manage football player and team information. The application features a complete user authentication system with role-based access control, allowing administrators to edit player and team information while regular users can only view the data.

## Features
- **User Authentication**: Secure login and registration system
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Player Management**: View and edit player information (admin only)
- **Team Management**: View and edit team information (admin only)
- **Responsive UI**: Modern Bootstrap-based interface
- **Data Persistence**: MongoDB database integration
- **Players Overview**: View all players with sorting and filtering options
- **Team Details**: View detailed information about each team and its players

## Project Structure
```
football-json/
│── public/                 # Static assets
│   └── css/                # Stylesheets
│── views/                  # EJS templates
│   │── partials/           # Reusable template parts
│   └── *.ejs               # Page templates
│── database.ts            # Database connection and data access functions
│── index.ts               # Main application entry point
│── secureMiddleware.ts     # Authentication middleware
│── session.ts             # Session configuration
│── types.ts               # Type definitions
└── package.json            # Project dependencies
```

## Technology Stack
- **Backend**: Node.js with Express
- **Frontend**: EJS templates with Bootstrap 5
- **Database**: MongoDB
- **Authentication**: express-session with connect-mongodb-session
- **Password Security**: bcrypt for password hashing
- **TypeScript**: For type-safe JavaScript code

## Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

### Running the Application
1. Start the server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`

### Development
For development with automatic reloading:
```
npm run dev
```

### Default Users
The application creates two default users on startup:
- Admin: username: `admin`, password: `admin123`
- Regular User: username: `user`, password: `user123`

## Authentication System
The application implements a user authentication system with role-based access control:

1. **User Registration**: New users can register with a username and password
2. **Session Management**: User sessions are stored in MongoDB
3. **Role-Based Access**: Different UI elements and routes based on user role
4. **Protected Routes**: Middleware to prevent unauthorized access

## Data Management
The application loads player and team data from JSON files on first run and stores them in MongoDB for subsequent access. Administrators can edit this data through the UI.

## Deployed Application
The application is deployed and accessible at: https://football-json.onrender.com
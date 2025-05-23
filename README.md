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

## Project Structure
The project follows a modular structure with clear separation of concerns:

```
/
├── models/             # Mongoose models for database entities
│   ├── Player.ts      # Player model definition
│   ├── Team.ts        # Team model definition
│   └── User.ts        # User model with authentication methods
├── public/            # Static assets
│   ├── css/           # Stylesheets
│   └── images/        # Image assets
├── types/             # TypeScript type definitions
├── views/             # EJS templates
│   ├── partials/      # Reusable template components
│   └── *.ejs          # Page templates
├── database.ts        # Database connection and data access functions
├── index.ts           # Main application entry point
├── secureMiddleware.ts # Authentication middleware
├── session.ts         # Session configuration
└── types.ts           # Type definitions for the application
```

## Technology Stack
- **Backend**: Node.js with Express
- **Frontend**: EJS templates with Bootstrap 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: express-session with connect-mongodb-session
- **Password Security**: bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

### Running the Application
1. Build the TypeScript code:
   ```
   npm run build
   ```
2. Start the server:
   ```
   npm start
   ```
3. Access the application at: http://localhost:3001

### Default Users
The application creates two default users on startup:
- Admin: username: `admin`, password: `admin123`
- Regular User: username: `user`, password: `user123`

## Authentication System
The application implements a complete user authentication system with role-based access control:

1. **User Registration**: New users can register with a username and password
2. **Session Management**: User sessions are stored in MongoDB
3. **Role-Based Access**: Different UI elements and routes based on user role
4. **Protected Routes**: Middleware to prevent unauthorized access
5. **Admin Privileges**: Special routes and actions for administrators

## Data Management
The application loads player and team data from JSON files on first run and stores them in MongoDB for subsequent access. Administrators can edit this data through the UI.

## Features

- **Players Overview**: View all players in a table format with sorting and filtering options.
- **Player Details**: View detailed information about each player including their skills, team, and teammates.
- **Teams Overview**: Browse all teams with sorting and filtering capabilities.
- **Team Details**: View detailed information about each team and its players.
- **Responsive Design**: Optimized for different screen sizes.

## Project Structure

```
football-json/
├── dist/                   # Compiled JavaScript files
├── interfaces/             # TypeScript interfaces
│   └── types.ts            # Type definitions
├── public/                 # Static assets
│   ├── css/                # Stylesheets
│   │   └── style.css       # Main stylesheet
│   └── js/                 # Client-side scripts
├── src/                    # Source files
│   └── app.ts              # Main Express application
├── views/                  # EJS templates
│   ├── partials/           # Reusable template parts
│   │   ├── footer.ejs      # Page footer
│   │   ├── header.ejs      # Page header
│   │   └── nav.ejs         # Navigation bar
│   ├── error.ejs           # Error page
│   ├── playerDetail.ejs    # Player detail page
│   ├── players.ejs         # Players list page
│   ├── teamDetail.ejs      # Team detail page
│   └── teams.ejs           # Teams list page
├── players.json            # Player data
├── teams.json              # Team data
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/football-json.git
   cd football-json
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Development

For development with automatic reloading:
```
npm run dev
```

## Technologies Used

- **TypeScript**: For type-safe JavaScript code
- **Express.js**: Web framework for Node.js
- **EJS**: Templating engine
- **CSS**: For styling the application 

## Deployed Application

The application is deployed and accessible at: https://football-json.onrender.com
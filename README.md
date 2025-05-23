# Football Cards Web Application

A web application built with Express.js and TypeScript that displays a collection of football players and their teams.

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
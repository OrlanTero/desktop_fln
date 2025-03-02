# FLN Services Corporation Desktop Application

This is a desktop application for FLN Services Corporation built with Electron, React, and Material UI. The application connects to a PHP API backend with a MySQL database.

## Features

- User authentication
- User management (CRUD operations)
- Dashboard with statistics
- Modern UI with Material UI components

## Prerequisites

- Node.js (v14 or higher)
- PHP (v7.4 or higher)
- MySQL (v5.7 or higher)
- Composer

## Installation

### Frontend (Electron/React)

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Backend (PHP API)

1. Navigate to the `api` directory
2. Install PHP dependencies:
   ```
   composer install
   ```
3. Configure the database connection in `api/config/database.php`
4. Start the PHP server:
   ```
   php -S localhost:4005
   ```

## Building for Production

To build the application for production:

```
npm run make
```

This will create platform-specific distributables in the `out` directory.

## Project Structure

- `src/` - Frontend source code (React/Electron)
  - `pages/` - React page components
  - `components/` - Reusable React components
  - `index.js` - Main Electron process
  - `renderer.js` - Renderer process entry point
  - `preload.js` - Preload script for secure IPC
- `api/` - Backend PHP API
  - `controllers/` - API controllers
  - `models/` - Database models
  - `config/` - Configuration files
  - `index.php` - API entry point

## License

MIT 
# API for FLN Desktop Application

This is the API backend for the FLN Desktop Application. It uses PHP with PDO for MySQL database connection and Klein for routing.

## Setup Instructions

1. Make sure you have PHP 7.4+ and MySQL installed
2. Create a MySQL database named `fln_new_db`
3. Install Composer dependencies:
   ```
   cd api
   composer install
   ```
4. Start the PHP development server (included for testing):
   - On Windows: `start-server.bat`
   - On macOS/Linux: `chmod +x start-server.sh && ./start-server.sh`
   
   This will start a development server at http://localhost:4005
   
   Alternatively, configure your web server (Apache/Nginx) to serve the API from the `api` directory:
   - For Apache, the included .htaccess file should handle URL rewriting
   - For Nginx, configure URL rewriting to point all requests to index.php

## API Endpoints

- `GET /test` - Test if the API is working
- `GET /db-test` - Test database connection

## Database Configuration

Database connection settings can be modified in `config/database.php`:
- Database name: fln_new_db
- Username: root
- Password: (empty by default)
- Host: localhost

## Troubleshooting

If you encounter connection issues:

1. Make sure MySQL is running and the database `fln_new_db` exists
2. Check that the database credentials in `config/database.php` are correct
3. Ensure the PHP development server is running at http://localhost:4005
4. Check that the required PHP extensions (PDO, PDO_MySQL) are enabled 
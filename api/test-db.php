<?php
require_once 'config/Database.php';

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...\n";

try {
    // Create database connection
    $database = new Database();
    $conn = $database->getConnection();
    echo "Database connection successful\n";
    
    // Drop the existing documents table
    echo "Dropping existing documents table...\n";
    $conn->exec("DROP TABLE IF EXISTS documents");
    echo "Table dropped successfully\n";
    
    // Create the table with correct structure
    echo "Creating documents table with correct structure...\n";
    $sql = "CREATE TABLE documents (
        document_id INT PRIMARY KEY AUTO_INCREMENT,
        proposal_id INT NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE CASCADE
    )";
    
    try {
        $conn->exec($sql);
        echo "Documents table created successfully\n";
        
        // Verify table structure
        $stmt = $conn->query("DESCRIBE documents");
        echo "\nNew table structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode($row) . "\n";
        }
    } catch (PDOException $e) {
        echo "Error creating table: " . $e->getMessage() . "\n";
    }
    
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
} 
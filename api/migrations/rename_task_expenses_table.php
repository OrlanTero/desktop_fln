<?php
// Include database configuration
require_once dirname(__FILE__) . '/../config/database.php';

try {
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Connected to database successfully.\n";
    
    // Check if the old table exists
    $checkTableQuery = "SHOW TABLES LIKE 'task_expenses'";
    $stmt = $db->prepare($checkTableQuery);
    $stmt->execute();
    $oldTableExists = $stmt->rowCount() > 0;
    
    if ($oldTableExists) {
        // Check if the new table already exists
        $checkNewTableQuery = "SHOW TABLES LIKE 'task_submission_expenses'";
        $stmt = $db->prepare($checkNewTableQuery);
        $stmt->execute();
        $newTableExists = $stmt->rowCount() > 0;
        
        if ($newTableExists) {
            // If both tables exist, copy data from old to new
            echo "Both tables exist. Copying data from task_expenses to task_submission_expenses...\n";
            
            // Get all data from old table
            $selectQuery = "SELECT * FROM task_expenses";
            $stmt = $db->prepare($selectQuery);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($rows) > 0) {
                // Begin transaction
                $db->beginTransaction();
                
                try {
                    // Insert data into new table
                    $insertQuery = "INSERT INTO task_submission_expenses 
                                    (submission_id, description, amount, created_at) 
                                    VALUES 
                                    (:submission_id, :description, :amount, :created_at)";
                    
                    $insertStmt = $db->prepare($insertQuery);
                    
                    foreach ($rows as $row) {
                        $insertStmt->bindParam(':submission_id', $row['submission_id']);
                        $insertStmt->bindParam(':description', $row['description']);
                        $insertStmt->bindParam(':amount', $row['amount']);
                        $insertStmt->bindParam(':created_at', $row['created_at']);
                        $insertStmt->execute();
                    }
                    
                    // Commit transaction
                    $db->commit();
                    
                    echo "Data copied successfully.\n";
                } catch (Exception $e) {
                    // Rollback transaction on error
                    $db->rollBack();
                    throw $e;
                }
            } else {
                echo "No data to copy from task_expenses.\n";
            }
            
            // Drop old table
            $dropQuery = "DROP TABLE task_expenses";
            $db->exec($dropQuery);
            
            echo "Old table 'task_expenses' dropped.\n";
        } else {
            // If only old table exists, rename it
            echo "Renaming table task_expenses to task_submission_expenses...\n";
            
            $renameQuery = "RENAME TABLE task_expenses TO task_submission_expenses";
            $db->exec($renameQuery);
            
            echo "Table renamed successfully.\n";
        }
    } else if (!$oldTableExists) {
        // Check if the new table exists
        $checkNewTableQuery = "SHOW TABLES LIKE 'task_submission_expenses'";
        $stmt = $db->prepare($checkNewTableQuery);
        $stmt->execute();
        $newTableExists = $stmt->rowCount() > 0;
        
        if (!$newTableExists) {
            // If neither table exists, create the new one
            echo "Creating task_submission_expenses table...\n";
            
            $createQuery = "CREATE TABLE task_submission_expenses (
                id INT(11) NOT NULL AUTO_INCREMENT,
                submission_id INT(11) NOT NULL,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                created_at DATETIME NOT NULL,
                PRIMARY KEY (id),
                KEY submission_id (submission_id)
            )";
            
            $db->exec($createQuery);
            
            echo "Table 'task_submission_expenses' created successfully.\n";
        } else {
            echo "Table 'task_submission_expenses' already exists.\n";
        }
    }
    
    echo "Migration completed successfully.\n";
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
CREATE TABLE IF NOT EXISTS assigned_job_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_order_id INT NOT NULL,
    liaison_id INT NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('In Progress', 'Completed', 'On Hold') DEFAULT 'In Progress',
    notes TEXT,
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (liaison_id) REFERENCES users(id) ON DELETE CASCADE
); 
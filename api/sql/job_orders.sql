CREATE TABLE IF NOT EXISTS job_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    proposal_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    estimated_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

-- Add index for better query performance
CREATE INDEX idx_job_orders_service ON job_orders(service_id);
CREATE INDEX idx_job_orders_proposal ON job_orders(proposal_id); 
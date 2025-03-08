-- Add project_id column to job_orders table
ALTER TABLE job_orders ADD COLUMN project_id INT;

-- Add foreign key constraint
ALTER TABLE job_orders ADD CONSTRAINT fk_job_orders_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_job_orders_project ON job_orders(project_id); 
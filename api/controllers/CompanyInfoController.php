<?php
class CompanyInfoController {
    private $conn;
    private $table_name = "company_info";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get company info
    public function get() {
        try {
            $companyInfo = new CompanyInfo($this->conn);
            
            if($companyInfo->get()) {
                return array(
                    "status" => "success",
                    "data" => array(
                        "company_name" => $companyInfo->company_name,
                        "address" => $companyInfo->address,
                        "phone" => $companyInfo->phone,
                        "email" => $companyInfo->email,
                        "updated_at" => $companyInfo->updated_at
                    )
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Company info not found"
                );
            }
        } catch(Exception $e) {
            return array(
                "status" => "error",
                "message" => $e->getMessage()
            );
        }
    }
    
    // Update company info
    public function update($data) {
        try {
            $companyInfo = new CompanyInfo($this->conn);
            
            // Set company info properties
            $companyInfo->company_name = $data['company_name'];
            $companyInfo->address = $data['address'];
            $companyInfo->phone = $data['phone'];
            $companyInfo->email = $data['email'];
            
            if($companyInfo->update()) {
                return array(
                    "status" => "success",
                    "message" => "Company info updated successfully"
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to update company info"
                );
            }
        } catch(Exception $e) {
            return array(
                "status" => "error",
                "message" => $e->getMessage()
            );
        }
    }
} 
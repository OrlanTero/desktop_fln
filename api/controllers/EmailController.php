<?php
require_once __DIR__ . '/../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once __DIR__ . '/../templates/email_template.php';

class EmailController {
    private $db;
    private $baseUrl;

    public function __construct($db) {
        $this->db = $db;
        // Set your base URL here
        $this->baseUrl = 'http://localhost:4005'; // Update this with your actual domain
    }

    public function send($data) {
        try {
            // Validate required data
            if (!isset($data['credentials']) || !isset($data['credentials']['email']) || !isset($data['credentials']['password'])) {
                return array('success' => false, 'message' => 'Email credentials are required');
            }
            if (!isset($data['to'])) {
                return array('success' => false, 'message' => 'Recipient email is required');
            }
            if (!isset($data['subject'])) {
                return array('success' => false, 'message' => 'Email subject is required');
            }
            if (!isset($data['proposalData'])) {
                return array('success' => false, 'message' => 'Proposal data is required');
            }
            if (!isset($data['clientName'])) {
                // Try to get client name from proposal data if available
                $data['clientName'] = isset($data['proposalData']['client_name']) ? $data['proposalData']['client_name'] : 'Valued Client';
            }

            // Gmail API configuration
            $email = $data['credentials']['email'];
            $password = $data['credentials']['password'];
            
            // Create PHPMailer instance
            $mail = new PHPMailer(true);
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $email;
            $mail->Password = $password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            
            // Recipients
            $mail->setFrom($email, 'FLN Services Corporation');
            $mail->addAddress($data['to']);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $data['subject'];
            
            // Convert array to object if necessary
            $proposalData = is_array($data['proposalData']) ? (object)$data['proposalData'] : $data['proposalData'];
            
            // Generate HTML content using template
            $htmlContent = generateEmailTemplate(
                $proposalData,
                $data['clientName'],
                $proposalData->proposal_id ?? $proposalData['proposal_id'] ?? 0,
                $this->baseUrl
            );
            
            $mail->Body = $htmlContent;
            $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], "\n", $htmlContent));
            
            // Add attachments
            if (isset($data['attachments']) && is_array($data['attachments'])) {
                foreach ($data['attachments'] as $attachment) {
                    if (isset($attachment['content']) && isset($attachment['filename'])) {
                        $mail->addStringAttachment(
                            base64_decode($attachment['content']),
                            $attachment['filename'],
                            'base64',
                            $attachment['mimeType'] ?? 'application/pdf'
                        );
                    }
                }
            }
            
            // Send email
            if ($mail->send()) {
                return array('success' => true, 'message' => 'Email sent successfully');
            } else {
                return array('success' => false, 'message' => 'Failed to send email');
            }
        } catch (Exception $e) {
            error_log("EmailController::send - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }
} 
<?php
require_once __DIR__ . '/../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function sendEmail($data) {
        try {
            $mail = new PHPMailer(true);

            // Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $data['credentials']['email'];
            $mail->Password = $data['credentials']['password'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            // Recipients
            $mail->setFrom($data['credentials']['email'], 'FLN Services Corporation');
            $mail->addAddress($data['to']);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $data['subject'];
            $mail->Body = $data['message'];

            // Attachments
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $attachment) {
                    $mail->addStringAttachment(
                        base64_decode($attachment['content']),
                        $attachment['filename'],
                        $attachment['encoding'],
                        $attachment['mimeType']
                    );
                }
            }

            $mail->send();

            return [
                'success' => true,
                'message' => 'Email sent successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"
            ];
        }
    }
} 
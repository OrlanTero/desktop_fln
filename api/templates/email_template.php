<?php
function generateEmailTemplate($proposalData, $clientName, $proposalId, $baseUrl) {
    $acceptUrl = $baseUrl . "/proposal-response.php?action=accept&proposal_id=" . $proposalId;
    $declineUrl = $baseUrl . "/proposal-response.php?action=decline&proposal_id=" . $proposalId;
    
    return '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-bottom: 3px solid #007bff;
            }
            .content {
                padding: 20px;
                background-color: #ffffff;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                margin: 10px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                text-align: center;
            }
            .accept {
                background-color: #28a745;
                color: white !important;
            }
            .decline {
                background-color: #dc3545;
                color: white !important;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Proposal Review Request</h2>
                <p>Reference: ' . htmlspecialchars($proposalData->proposal_reference) . '</p>
            </div>
            
            <div class="content">
                <p>Dear ' . htmlspecialchars($clientName) . ',</p>
                
                <p>We hope this email finds you well. We are pleased to present our proposal for your review.</p>
                
                <p>Please find the attached proposal document for your consideration. We would appreciate your feedback on this proposal.</p>
                
                <div class="button-container">
                    <a href="' . $acceptUrl . '" class="button accept">Accept Proposal</a>
                    <a href="' . $declineUrl . '" class="button decline">Decline Proposal</a>
                </div>
                
                <p>Key Details:</p>
                <ul>
                    <li>Proposal Reference: ' . htmlspecialchars($proposalData->proposal_reference) . '</li>
                    <li>Date: ' . date('F j, Y') . '</li>
                    <li>Valid Until: ' . htmlspecialchars($proposalData->valid_until) . '</li>
                </ul>
                
                <p>If you have any questions or need clarification, please don\'t hesitate to contact us.</p>
                
                <p>Best regards,<br>FLN Services Corporation</p>
            </div>
            
            <div class="footer">
                <p>This email was sent by FLN Services Corporation</p>
                <p>If you did not request this proposal, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>';
} 
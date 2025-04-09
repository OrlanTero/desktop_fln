<?php
// This script serves files from the uploads directory directly

// Disable error reporting for production
error_reporting(0);
ini_set('display_errors', 0);

// Get the requested file path from the URL
$path = isset($_GET['file']) ? $_GET['file'] : '';

// Security check - prevent directory traversal
if (empty($path) || strpos($path, '../') !== false) {
    header('HTTP/1.0 403 Forbidden');
    exit('Access denied');
}

// Get the absolute file path
$filePath = __DIR__ . '/' . $path;

// Check if the file exists
if (!file_exists($filePath) || is_dir($filePath)) {
    header('HTTP/1.0 404 Not Found');
    exit('File not found: ' . htmlspecialchars($path));
}

// Get file extension
$extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

// Set content type based on file extension
$contentTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'pdf' => 'application/pdf',
    'txt' => 'text/plain',
];

$contentType = isset($contentTypes[$extension]) ? $contentTypes[$extension] : 'application/octet-stream';

// Set headers
header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: max-age=86400'); // Cache for 1 day

// Output the file
readfile($filePath);
<?php
// This script serves files from the uploads directory directly

// Get the requested file path
$requestUri = $_SERVER['REQUEST_URI'];
$uploads_dir = __DIR__ . '/uploads/';

// Make sure the request is for a file in the uploads directory
if (strpos($requestUri, '/uploads/') === 0) {
    $file_path = $uploads_dir . substr($requestUri, 9); // Remove '/uploads/' from the path

    if (file_exists($file_path)) {
        // Get file extension
        $ext = pathinfo($file_path, PATHINFO_EXTENSION);

        // Set the appropriate content type based on file extension
        switch (strtolower($ext)) {
            case 'jpg':
            case 'jpeg':
                header('Content-Type: image/jpeg');
                break;
            case 'png':
                header('Content-Type: image/png');
                break;
            case 'gif':
                header('Content-Type: image/gif');
                break;
            case 'pdf':
                header('Content-Type: application/pdf');
                break;
            default:
                header('Content-Type: application/octet-stream');
        }

        // Output the file
        readfile($file_path);
        exit;
    }
}

// If the file doesn't exist or isn't in uploads, return 404
header("HTTP/1.0 404 Not Found");
echo "File not found.";
<?php
// Get the requested file from the path
$requestedFile = isset($_GET['file']) ? $_GET['file'] : '';

// Security check - make sure the file is within the uploads directory
$filePath = dirname(__FILE__) . '/' . $requestedFile;
$realPath = realpath($filePath);
$uploadsDir = realpath(dirname(__FILE__));

// Make sure the file exists and is within the uploads directory
if ($realPath && file_exists($realPath) && strpos($realPath, $uploadsDir) === 0) {
    // Get file extension
    $ext = pathinfo($realPath, PATHINFO_EXTENSION);

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
    readfile($realPath);
    exit;
} else {
    // If the file doesn't exist or isn't in uploads, return a list of files
    echo '<h1>Files in uploads directory</h1>';
    echo '<ul>';

    function listDir($dir, $prefix = '')
    {
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                $fullPath = $dir . '/' . $file;
                if (is_dir($fullPath)) {
                    echo '<li>📁 ' . $file . '</li>';
                    echo '<ul>';
                    listDir($fullPath, $prefix . $file . '/');
                    echo '</ul>';
                } else {
                    echo '<li>📄 <a href="?file=' . $prefix . $file . '">' . $file . '</a></li>';
                }
            }
        }
    }

    listDir(dirname(__FILE__));

    echo '</ul>';
}
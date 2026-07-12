<?php
/**
 * Database Configuration for GoTek Feedback Website
 * Compatible with local environments (XAMPP/WAMP) and Hostinger.
 */

define('DB_HOST', 'sql213.infinityfree.com');
define('DB_USER', 'if0_42389824');
define('DB_PASS', 'hDPlymG794cWZfu');
define('DB_NAME', 'if0_42389824_XXX');

// SMTP Configuration
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'info@gotekid.com');
define('SMTP_PASS', 'Gotekid@2026'); // Enter SMTP password/App password for info@gotekid.com

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Log the exact error to PHP's system logs
    error_log("Database connection failed: " . $e->getMessage());
    
    // Log to a temporary file in htdocs for direct FTP verification
    file_put_contents(__DIR__ . '/db_error.log', '[' . date('Y-m-d H:i:s') . '] Connection error: ' . $e->getMessage() . PHP_EOL, FILE_APPEND);

    // If request is AJAX, return JSON error, otherwise print text
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed. Please make sure the database is running and credentials in config.php are correct.'
    ]);
    exit;
}

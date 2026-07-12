<?php
/**
 * Submit Feedback API Endpoint
 * Receives feedback data, validates, and saves it securely to the MySQL database.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';

require_once 'config.php';

/**
 * Format feedback submission timestamp to display only the full date in Asia/Kolkata (IST) timezone.
 */
function formatFeedbackTimestamp($timestampStr = 'now') {
    date_default_timezone_set('Asia/Kolkata');
    $timezone = new DateTimeZone('Asia/Kolkata');
    $dt = new DateTime($timestampStr, $timezone);
    return $dt->format('j F Y'); // e.g. "11 July 2026"
}

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Only allow POST request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

// Decode raw JSON input (sent via fetch API)
$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

// If not JSON, try standard POST array
if (!$input) {
    $input = $_POST;
}

// Extract, trim, and sanitize inputs (strip tags to prevent XSS storage)
$fullName = isset($input['fullName']) ? strip_tags(trim($input['fullName'])) : '';
$orgType = isset($input['organizationType']) ? strip_tags(trim($input['organizationType'])) : '';
$rating = isset($input['rating']) ? intval($input['rating']) : 0;
$feedbackMessage = isset($input['feedbackText']) ? strip_tags(trim($input['feedbackText'])) : '';
$recommend = isset($input['recommend']) ? strip_tags(trim($input['recommend'])) : '';

$referralName = isset($input['referralName']) ? strip_tags(trim($input['referralName'])) : '';
$referralContact = isset($input['referralContact']) ? strip_tags(trim($input['referralContact'])) : '';

// Validation checks for required fields
if (
    empty($fullName) || 
    empty($orgType) || 
    $rating < 1 || 
    $rating > 5 || 
    empty($feedbackMessage) || 
    empty($recommend)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required and must be filled.']);
    exit;
}


// Clear referral details if recommendation is "No"
if ($recommend !== 'Yes') {
    $referralName = '';
    $referralContact = '';
}

try {
    // Check for duplicate feedback submitted in the last minute (protects against double clicks and spam)
    $dupSql = "SELECT id FROM feedback 
               WHERE full_name = :full_name 
                 AND rating = :rating 
                 AND feedback_message = :feedback_message 
                 AND created_at > NOW() - INTERVAL 1 MINUTE";
    $dupStmt = $pdo->prepare($dupSql);
    $dupStmt->execute([
        ':full_name' => $fullName,
        ':rating' => $rating,
        ':feedback_message' => $feedbackMessage
    ]);
    if ($dupStmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode([
            'success' => false,
            'error' => 'You have already submitted this review recently. Please wait a moment.'
        ]);
        exit;
    }

    // Insert statement using prepared statements to prevent SQL Injection
    $sql = "INSERT INTO feedback (full_name, organization_type, rating, feedback_message, recommend, referral_name, referral_contact) 
            VALUES (:full_name, :org_type, :rating, :feedback_message, :recommend, :referral_name, :referral_contact)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':full_name' => $fullName,
        ':org_type' => $orgType,
        ':rating' => $rating,
        ':feedback_message' => $feedbackMessage,
        ':recommend' => $recommend,
        ':referral_name' => $referralName ?: null,
        ':referral_contact' => $referralContact ?: null
    ]);

    // Send HTML email notification to the administrator
    try {
        $mail = new PHPMailer(true);

        // Server settings
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;

        // Enable detailed SMTP debugging
        $mail->SMTPDebug  = 2;
        $mail->Debugoutput = function($str, $level) {
            file_put_contents(__DIR__ . '/mail_debug.log', '[' . date('Y-m-d H:i:s') . '] ' . trim($str) . PHP_EOL, FILE_APPEND);
        };

        // Recipients
        $mail->setFrom(SMTP_USER, 'GoTek Feedback Portal');
        $mail->addAddress('info@gotekid.com');

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'New GoTek Feedback Submitted';
        
        $emailBody = "
        <html>
        <head>
          <title>New Feedback Received</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333333; 
              background-color: #FAFBFF;
              padding: 30px;
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              padding: 30px; 
              background: #FFFFFF; 
              border-radius: 8px; 
              border: 1px solid #DCE3F0;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            }
            h2 { 
              color: #0B47E5; 
              font-size: 1.5rem; 
              margin-top: 0;
              margin-bottom: 12px;
              font-weight: 700;
              text-align: left;
            }
            .divider {
              height: 2px;
              background-color: #0B47E5;
              margin-bottom: 25px;
              width: 100%;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              border: 1px solid #E2E8F0;
            }
            tr {
              border-bottom: 1px solid #E2E8F0;
            }
            tr:last-child {
              border-bottom: none;
            }
            th, td { 
              padding: 16px 20px; 
              text-align: left;
              vertical-align: middle;
              font-size: 0.95rem;
            }
            th { 
              font-weight: 700; 
              color: #2D3748; 
              width: 38%; 
              background-color: #F8FAFC;
              border-right: 1px solid #E2E8F0;
            }
            td { 
              color: #4A5568; 
              background-color: #FFFFFF;
              word-break: break-word;
            }
          </style>
        </head>
        <body>
          <div class='container'>
            <h2>Feedback Form Details</h2>
            <div class='divider'></div>
            <table>
              <tr>
                <th>Full Name</th>
                <td>" . htmlspecialchars($fullName) . "</td>
              </tr>
              <tr>
                <th>Organization Type</th>
                <td>" . htmlspecialchars($orgType) . "</td>
              </tr>
              <tr>
                <th>Rating</th>
                <td>" . htmlspecialchars($rating) . " / 5 Stars</td>
              </tr>
              <tr>
                <th>Feedback Message</th>
                <td>" . nl2br(htmlspecialchars($feedbackMessage)) . "</td>
              </tr>
              <tr>
                <th>Recommend GoTek?</th>
                <td>" . htmlspecialchars($recommend) . "</td>
              </tr>
              " . ($recommend === 'Yes' ? "
              <tr>
                <th>Referral Name</th>
                <td>" . ($referralName ? htmlspecialchars($referralName) : 'N/A') . "</td>
              </tr>
              <tr>
                <th>Referral Contact</th>
                <td>" . htmlspecialchars($referralContact) . "</td>
              </tr>
              " : "") . "
              <tr>
                <th>Submission Date</th>
                <td>" . formatFeedbackTimestamp() . "</td>
              </tr>
            </table>
          </div>
        </body>
        </html>
        ";

        $mail->Body = $emailBody;

        // Verify SMTP connection and authentication is successful
        if (!$mail->smtpConnect()) {
            throw new Exception("SMTP connection/authentication failed. Please check SMTP credentials.");
        }

        $mail->send();
    } catch (Exception $e) {
        // Log the exact SMTP/PHPMailer error for debugging
        $errorMsg = "PHPMailer Exception: " . $e->getMessage() . " | ErrorInfo: " . $mail->ErrorInfo;
        error_log($errorMsg);
        file_put_contents(__DIR__ . '/mail_debug.log', '[' . date('Y-m-d H:i:s') . '] ERROR: ' . $errorMsg . PHP_EOL, FILE_APPEND);
    }

    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Feedback submitted successfully.',
        'id' => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Failed to save your feedback. Database connection error.'
    ]);
}


<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/bootstrap.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
if (requestMethod() !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['converted' => false]);
    exit;
}
if (!requestAppearsSameSite()) {
    http_response_code(403);
    echo json_encode(['converted' => false]);
    exit;
}
startApplicationSession();
$converted = ($_SESSION[SESSION_CONTACT_CONVERSION_KEY] ?? false) === true;
unset($_SESSION[SESSION_CONTACT_CONVERSION_KEY]);
session_write_close();
echo json_encode(['converted' => $converted], JSON_THROW_ON_ERROR);

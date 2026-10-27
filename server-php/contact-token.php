<?php

declare(strict_types=1);

require_once __DIR__ .
    '/includes/bootstrap.php';

header(
    'Content-Type: application/json; charset=UTF-8'
);

header(
    'Cache-Control: no-store, no-cache, must-revalidate, max-age=0'
);

if (requestMethod() !== 'GET') {
    header('Allow: GET');
    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.',
    ]);

    exit;
}

startApplicationSession();

echo json_encode(
    [
        'csrf_token' => csrfToken(),
    ],
    JSON_THROW_ON_ERROR
);

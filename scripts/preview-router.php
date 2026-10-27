<?php
declare(strict_types=1);

// Local production-build preview only. Apache uses public/.htaccess in hosting.
// Never send mail from a preview; validation still runs and returns send-error.
define('CONTACT_LOCAL_PREVIEW', true);
$root = realpath(__DIR__ . '/../dist');
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
if (!$root || preg_match('~(?:^|/)(?:\.|includes(?:/|$)|tmp(?:/|$)|_notes(?:/|$)|error_log$)~', $path)) {
    http_response_code(403);
    exit('Access denied');
}
if (preg_match('~^/contact-(token|submit|conversion)(?:\.php)?/?$~', $path, $match)) {
    require $root . '/contact-' . $match[1] . '.php';
    return true;
}
$relative = $path === '/' ? '/index.html' : rtrim($path, '/');
$file = realpath($root . $relative);
if (!$file || !is_file($file)) {
    $file = realpath($root . $relative . '.html');
}
if (!$file || !str_starts_with($file, $root . '/') || !is_file($file)) {
    http_response_code(404);
    header('Content-Type: text/html; charset=UTF-8');
    readfile($root . '/404.html');
    return true;
}
if (str_ends_with($file, '.php')) {
    http_response_code(403);
    exit('Access denied');
}
if (str_ends_with($file, '.html')) {
    header('Content-Type: text/html; charset=UTF-8');
    readfile($file);
    return true;
}
return false;

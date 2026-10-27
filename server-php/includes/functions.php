<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Shared Helper Functions
|--------------------------------------------------------------------------
|
| Reusable functions for escaping output, building asset URLs, formatting
| contact information, retrieving page metadata, handling form input, and
| performing common validation and request checks.
|
*/

/*
|--------------------------------------------------------------------------
| HTML Escaping
|--------------------------------------------------------------------------
|
| Escape a value for safe HTML output.
|
*/

function e(
    string|int|float|null $value
): string {
    return htmlspecialchars(
        (string) $value,
        ENT_QUOTES | ENT_SUBSTITUTE,
        APP_CHARSET
    );
}

/*
|--------------------------------------------------------------------------
| Asset URLs
|--------------------------------------------------------------------------
|
| Append an optional cache-busting version to a local asset path.
|
| Example:
|
| asset('/css/style.css', VERSION_CSS)
|
| Returns:
|
| /css/style.css?v=1.0.0
|
*/

function asset(
    string $path,
    string $version = ''
): string {
    $path =
        trim($path);

    if ($path === '') {
        return '';
    }

    if ($version === '') {
        return $path;
    }

    $separator =
        str_contains($path, '?')
            ? '&'
            : '?';

    return $path .
        $separator .
        'v=' .
        rawurlencode($version);
}

/*
|--------------------------------------------------------------------------
| HTTP Security Headers
|--------------------------------------------------------------------------
|
| Send shared browser security headers for HTTP requests.
|
| Content Security Policy is intentionally managed separately because the
| site currently uses Google Tag Manager and Calendly integrations.
|
*/

function contentSecurityPolicyNonce(): string
{
    static $nonce = null;

    if (is_string($nonce)) {
        return $nonce;
    }

    $nonce =
        base64_encode(
            random_bytes(18)
        );

    return $nonce;
}

function sendSecurityHeaders(): void
{
    if (PHP_SAPI === 'cli') {
        return;
    }

    /*
    |----------------------------------------------------------------------
    | Remove PHP Version Disclosure
    |----------------------------------------------------------------------
    */

    header_remove(
        'X-Powered-By'
    );

    /*
    |----------------------------------------------------------------------
    | HTTPS Transport Security
    |----------------------------------------------------------------------
    |
    | Do not add includeSubDomains or preload unless every applicable
    | subdomain has been independently verified for permanent HTTPS use.
    |
    */

    header(
        'Strict-Transport-Security: max-age=31536000'
    );

    /*
    |----------------------------------------------------------------------
    | Browser Protections
    |----------------------------------------------------------------------
    */

    header(
        'X-Content-Type-Options: nosniff'
    );

    header(
        'Referrer-Policy: strict-origin-when-cross-origin'
    );

    header(
        'Permissions-Policy: geolocation=(), camera=(), microphone=()'
    );

    header(
        'X-Frame-Options: SAMEORIGIN'
    );

    /*
    |----------------------------------------------------------------------
    | Content Security Policy
    |----------------------------------------------------------------------
    */

    $cspNonce =
        contentSecurityPolicyNonce();

    $contentSecurityPolicy =
        implode(
            '; ',
            [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-ancestors 'self'",
                "form-action 'self'",
                "script-src 'self' 'nonce-" .
                    $cspNonce .
                    "' https://www.googletagmanager.com https://assets.calendly.com",
                "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://calendly.com https://*.calendly.com",
                "frame-src https://www.googletagmanager.com https://calendly.com https://*.calendly.com",
            ]
        );

    header(
        'Content-Security-Policy: ' .
        $contentSecurityPolicy
    );
}

/*
|--------------------------------------------------------------------------
| Application Session
|--------------------------------------------------------------------------
|
| Start the application session only when a request requires session state.
|
| Public pages that do not use CSRF, rate limiting, or one-time conversion
| state should not create a PHP session or session cookie.
|
*/

function startApplicationSession(): void
{
    if (
        session_status() !==
        PHP_SESSION_NONE
    ) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,

        'path' => '/',

        'secure' => SESSION_COOKIE_SECURE,

        'httponly' => SESSION_COOKIE_HTTP_ONLY,

        'samesite' => SESSION_COOKIE_SAME_SITE,
    ]);

    session_start([
        'use_strict_mode' => true,
    ]);
}

/*
|--------------------------------------------------------------------------
| Site Image Retrieval
|--------------------------------------------------------------------------
|
| Return a managed site image definition.
|
| Returns an array containing the configured image metadata and the
| absolute image URL, or an empty array when the image is not defined.
|
*/

function getSiteImage(
    string $key
): array {
    $image =
        SITE_IMAGES[$key] ??
        [];

    if (
        !is_array($image) ||
        $image === []
    ) {
        return [];
    }

    $path =
        $image['path'] ??
        '';

    if (!is_string($path)) {
        $path =
            '';
    }

    $image['path'] =
        $path;

    $image['url'] =
        $path !== ''
            ? SITE_URL . $path
            : '';

    $extension =
        strtolower(
            pathinfo(
                $path,
                PATHINFO_EXTENSION
            )
        );

    $image['type'] =
        match ($extension) {
            'webp' => 'image/webp',

            'png' => 'image/png',

            'jpg',
            'jpeg' => 'image/jpeg',

            'avif' => 'image/avif',

            'svg' => 'image/svg+xml',

            default => '',
        };

    return $image;
}

/*
|--------------------------------------------------------------------------
| Site Image Rendering
|--------------------------------------------------------------------------
|
| Render a managed site image.
|
| Page-specific values may override registry defaults.
|
*/

function siteImage(
    string $key,
    array $overrides = []
): string {
    $image =
        getSiteImage(
            $key
        );

    if ($image === []) {
        return '';
    }

    $image =
        array_merge(
            $image,
            $overrides
        );

    $path =
        $image['path'] ??
        '';

    $alt =
        $image['alt'] ??
        '';

    $description =
        $image['description'] ??
        '';

    $includeDescription =
        $image['include_description'] ??
        true;

    $width =
        $image['width'] ??
        0;

    $height =
        $image['height'] ??
        0;

    $loading =
        $image['loading'] ??
        'lazy';

    $fetchPriority =
        $image['fetchpriority'] ??
        'auto';

    $decoding =
        $image['decoding'] ??
        'async';

    $class =
        $image['class'] ??
        '';

    $extraAttributes =
        $image['attributes'] ??
        [];

    if (
        !is_string($path) ||
        $path === ''
    ) {
        return '';
    }

    $attributes = [
        'src="' .
            e($path) .
            '"',

        'alt="' .
            e(
                is_string($alt)
                    ? $alt
                    : ''
            ) .
            '"',

        'width="' .
            e(
                (string) $width
            ) .
            '"',

        'height="' .
            e(
                (string) $height
            ) .
            '"',
    ];

    $descriptionId =
        '';

    if (
        $includeDescription === true &&
        is_string($description) &&
        trim($description) !== '' &&
        is_string($alt) &&
        trim($alt) !== ''
    ) {
        static $descriptionCounts = [];

        $descriptionKey =
            preg_replace(
                '/[^a-zA-Z0-9_-]+/',
                '-',
                strtolower($key)
            );

        if (
            !is_string($descriptionKey) ||
            $descriptionKey === ''
        ) {
            $descriptionKey =
                'image';
        }

        $descriptionCounts[$descriptionKey] =
            ($descriptionCounts[$descriptionKey] ?? 0) + 1;

        $descriptionId =
            'image-description-' .
            $descriptionKey .
            '-' .
            $descriptionCounts[$descriptionKey];

        $attributes[] =
            'aria-describedby="' .
            e($descriptionId) .
            '"';
    }

    if (
        is_string($class) &&
        $class !== ''
    ) {
        $attributes[] =
            'class="' .
            e($class) .
            '"';
    }

    if (
        is_string($loading) &&
        $loading !== ''
    ) {
        $attributes[] =
            'loading="' .
            e($loading) .
            '"';
    }

    if (
        is_string($fetchPriority) &&
        $fetchPriority !== ''
    ) {
        $attributes[] =
            'fetchpriority="' .
            e($fetchPriority) .
            '"';
    }

    if (
        is_string($decoding) &&
        $decoding !== ''
    ) {
        $attributes[] =
            'decoding="' .
            e($decoding) .
            '"';
    }

    if (is_array($extraAttributes)) {
        foreach ($extraAttributes as $name => $value) {
            if (
                !is_string($name) ||
                preg_match(
                    '/^[a-zA-Z_:][a-zA-Z0-9:._-]*$/',
                    $name
                ) !== 1 ||
                !is_scalar($value)
            ) {
                continue;
            }

            $attributes[] =
                e($name) .
                '="' .
                e((string) $value) .
                '"';
        }
    }

    $imageMarkup =
        '<img ' .
        implode(
            ' ',
            $attributes
        ) .
        '>';

    if ($descriptionId === '') {
        return $imageMarkup;
    }

    return $imageMarkup .
        '<span id="' .
        e($descriptionId) .
        '" class="visually-hidden">' .
        e(trim($description)) .
        '</span>';
}

/*
|--------------------------------------------------------------------------
| Page Configuration Retrieval
|--------------------------------------------------------------------------
|
| Return the shared configuration for a public page.
|
| An empty array is returned when the page identifier is not defined.
|
*/

function pageConfig(
    string $page
): array {
    $page =
        trim($page);

    if (
        $page === '' ||
        !isset(PAGE_CONFIG[$page]) ||
        !is_array(PAGE_CONFIG[$page])
    ) {
        return [];
    }

    return PAGE_CONFIG[$page];
}

/*
|--------------------------------------------------------------------------
| Page Publication Date
|--------------------------------------------------------------------------
|
| Return the publication date configured for a public page.
|
| SITE_RELEASE_DATE is used when no valid page-specific date is defined.
|
*/

function pagePublished(
    string $page
): string {
    $configuration =
        pageConfig(
            $page
        );

    $published =
        $configuration['published'] ??
        SITE_RELEASE_DATE;

    if (
        !is_string($published) ||
        $published === ''
    ) {
        return SITE_RELEASE_DATE;
    }

    return $published;
}

/*
|--------------------------------------------------------------------------
| Page Modification Date
|--------------------------------------------------------------------------
|
| Return the last meaningful modification date configured for a public
| page.
|
| The publication date is used when no valid modification date is defined.
|
*/

function pageModified(
    string $page
): string {
    $configuration =
        pageConfig(
            $page
        );

    $modified =
        $configuration['modified'] ??
        '';

    if (
        is_string($modified) &&
        $modified !== ''
    ) {
        return $modified;
    }

    return pagePublished(
        $page
    );
}

/*
|--------------------------------------------------------------------------
| Telephone Link Formatting
|--------------------------------------------------------------------------
|
| Convert a telephone number into a tel-link-safe value.
|
| Example:
|
| +1-773-609-0697
|
*/

function phoneHref(
    string $phone
): string {
    $phone =
        trim($phone);

    if ($phone === '') {
        return '';
    }

    $hasLeadingPlus =
        str_starts_with(
            $phone,
            '+'
        );

    $digits =
        preg_replace(
            '/\D+/',
            '',
            $phone
        );

    if (
        !is_string($digits) ||
        $digits === ''
    ) {
        return '';
    }

    return $hasLeadingPlus
        ? '+' . $digits
        : $digits;
}

/*
|--------------------------------------------------------------------------
| Telephone Display Formatting
|--------------------------------------------------------------------------
|
| Format a North American telephone number for display.
|
| Example:
|
| +1-773-609-0697 becomes 773.609.0697
|
*/

function phoneDisplay(
    string $phone
): string {
    $digits =
        preg_replace(
            '/\D+/',
            '',
            $phone
        );

    if (!is_string($digits)) {
        return trim($phone);
    }

    if (
        strlen($digits) === 11 &&
        str_starts_with(
            $digits,
            '1'
        )
    ) {
        $digits =
            substr(
                $digits,
                1
            );
    }

    if (strlen($digits) === 10) {
        return substr(
            $digits,
            0,
            3
        ) .
            '.' .
            substr(
                $digits,
                3,
                3
            ) .
            '.' .
            substr(
                $digits,
                6,
                4
            );
    }

    return trim($phone);
}

/*
|--------------------------------------------------------------------------
| Copyright Year Range
|--------------------------------------------------------------------------
|
| Return the current copyright year or year range.
|
*/

function copyrightYears(
    int $startYear = SITE_COPYRIGHT_START_YEAR
): string {
    $currentYear =
        (int) date('Y');

    if ($startYear >= $currentYear) {
        return (string) $currentYear;
    }

    return $startYear .
        '–' .
        $currentYear;
}

/*
|--------------------------------------------------------------------------
| Copyright Notice
|--------------------------------------------------------------------------
|
| Return the complete copyright notice.
|
*/

function copyrightNotice(): string
{
    return 'Copyright © ' .
        copyrightYears() .
        ' ' .
        SITE_COPYRIGHT_OWNER .
        '. All Rights Reserved.';
}

/*
|--------------------------------------------------------------------------
| Request Method
|--------------------------------------------------------------------------
|
| Return the current request method.
|
*/

function requestMethod(): string
{
    $method =
        $_SERVER['REQUEST_METHOD'] ??
        '';

    return is_string($method)
        ? strtoupper($method)
        : '';
}

/*
|--------------------------------------------------------------------------
| Same-Site Request Check
|--------------------------------------------------------------------------
|
| Determine whether the request appears to originate from this site.
|
| This is a supplemental check and does not replace CSRF validation.
|
*/

function requestAppearsSameSite(): bool
{
    // Allow only explicit loopback origins in the CLI preview router.
    // This branch is never enabled on the production PHP web server.
    if (PHP_SAPI === 'cli-server' && defined('CONTACT_LOCAL_PREVIEW')) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $source = $origin !== '' ? $origin : $referer;
        if ($source === '') return true;
        return preg_match('~^http://(?:127\.0\.0\.1|localhost):(?:8765|4321)(?:/|$)~', $source) === 1;
    }
    $siteHost =
        parse_url(
            SITE_URL,
            PHP_URL_HOST
        );

    if (
        !is_string($siteHost) ||
        $siteHost === ''
    ) {
        return false;
    }

    $siteHost =
        strtolower($siteHost);

    $origin =
        $_SERVER['HTTP_ORIGIN'] ??
        '';

    if (
        is_string($origin) &&
        $origin !== ''
    ) {
        $originHost =
            parse_url(
                $origin,
                PHP_URL_HOST
            );

        return is_string($originHost) &&
            strtolower($originHost) ===
                $siteHost;
    }

    $referer =
        $_SERVER['HTTP_REFERER'] ??
        '';

    if (
        is_string($referer) &&
        $referer !== ''
    ) {
        $refererHost =
            parse_url(
                $referer,
                PHP_URL_HOST
            );

        return is_string($refererHost) &&
            strtolower($refererHost) ===
                $siteHost;
    }

/*
|--------------------------------------------------------------------------
| Missing Origin and Referer
|--------------------------------------------------------------------------
|
| Some privacy tools omit both Origin and Referer. Allow the request to
| continue so CSRF validation can perform the primary verification.
|
*/

    return true;
}

/*
|--------------------------------------------------------------------------
| POST String Retrieval
|--------------------------------------------------------------------------
|
| Return a POST field as a trimmed string.
|
*/

function postString(
    string $key
): string {
    if (
        !isset($_POST[$key]) ||
        !is_string($_POST[$key])
    ) {
        return '';
    }

    return trim(
        $_POST[$key]
    );
}

/*
|--------------------------------------------------------------------------
| Submitted Text Normalization
|--------------------------------------------------------------------------
|
| Normalize line endings and trim submitted text.
|
*/

function normalizeSubmittedText(
    string $value
): string {
    $value =
        str_replace(
            [
                "\r\n",
                "\r",
            ],
            "\n",
            $value
        );

    return trim($value);
}

/*
|--------------------------------------------------------------------------
| Control Character Removal
|--------------------------------------------------------------------------
|
| Remove control characters that should not appear in ordinary form data.
|
*/

function removeControlCharacters(
    string $value
): string {
    $cleaned =
        preg_replace(
            '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',
            '',
            $value
        );

    return is_string($cleaned)
        ? $cleaned
        : '';
}

/*
|--------------------------------------------------------------------------
| Single-Line Input Normalization
|--------------------------------------------------------------------------
|
| Normalize a single-line form value.
|
*/

function normalizeSingleLineInput(
    string $value
): string {
    $value =
        removeControlCharacters(
            $value
        );

    $value =
        preg_replace(
            '/\s+/u',
            ' ',
            $value
        );

    return is_string($value)
        ? trim($value)
        : '';
}

/*
|--------------------------------------------------------------------------
| Multiline Input Normalization
|--------------------------------------------------------------------------
|
| Normalize a multiline form value.
|
*/

function normalizeMultilineInput(
    string $value
): string {
    $value =
        normalizeSubmittedText(
            $value
        );

    return removeControlCharacters(
        $value
    );
}

/*
|--------------------------------------------------------------------------
| Log Value Sanitization
|--------------------------------------------------------------------------
|
| Normalize and truncate a value before including it in logs or
| diagnostic messages.
|
*/

function sanitizeLogValue(
    string $value,
    int $maximumLength
): string {
    $value =
        normalizeSingleLineInput(
            $value
        );

    if (
        $maximumLength <= 0
    ) {
        return '';
    }

    if (
        !textExceedsLength(
            $value,
            $maximumLength
        )
    ) {
        return $value;
    }

    if (
        function_exists(
            'mb_substr'
        )
    ) {
        return mb_substr(
            $value,
            0,
            $maximumLength,
            APP_CHARSET
        );
    }

    return substr(
        $value,
        0,
        $maximumLength
    );
}

/*
|--------------------------------------------------------------------------
| Text Length Validation
|--------------------------------------------------------------------------
|
| Determine whether text exceeds the specified character limit.
|
*/

function textExceedsLength(
    string $value,
    int $maximumLength
): bool {
    if ($maximumLength < 0) {
        return true;
    }

    if (function_exists('mb_strlen')) {
        return mb_strlen(
            $value,
            APP_CHARSET
        ) > $maximumLength;
    }

    return strlen($value) >
        $maximumLength;
}

/*
|--------------------------------------------------------------------------
| Email Validation
|--------------------------------------------------------------------------
|
| Determine whether an email address is valid.
|
*/

function emailIsValid(
    string $email
): bool {
    if ($email === '') {
        return false;
    }

    return filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    ) !== false;
}

/*
|--------------------------------------------------------------------------
| Header Injection Detection
|--------------------------------------------------------------------------
|
| Detect carriage returns or line feeds used in header-injection attempts.
|
*/

function containsHeaderInjection(
    string $value
): bool {
    return str_contains(
        $value,
        "\r"
    ) ||
        str_contains(
            $value,
            "\n"
        );
}

/*
|--------------------------------------------------------------------------
| Redirect Handling
|--------------------------------------------------------------------------
|
| Redirect using a 303 See Other response by default.
|
*/

function redirectTo(
    string $location,
    int $statusCode = HTTP_STATUS_SEE_OTHER
): never {
    header(
        'Location: ' . $location,
        true,
        $statusCode
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| Contact Form Status Redirect
|--------------------------------------------------------------------------
|
| Redirect to the contact page with a form-status query parameter.
|
*/

function redirectToContactStatus(
    string $status
): never {
    redirectTo(
        SITE_CONTACT_PATH .
        '?status=' .
        rawurlencode($status)
    );
}

/*
|--------------------------------------------------------------------------
| JSON Encoding
|--------------------------------------------------------------------------
|
| Encode structured data safely for inclusion in HTML.
|
*/

function jsonForHtml(
    array $data
): string {
    return json_encode(
        $data,
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE |
        JSON_HEX_TAG |
        JSON_HEX_AMP |
        JSON_HEX_APOS |
        JSON_HEX_QUOT |
        JSON_THROW_ON_ERROR
    );
}

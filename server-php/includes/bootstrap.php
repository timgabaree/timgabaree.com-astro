<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Application Bootstrap
|--------------------------------------------------------------------------
|
| Loads and initializes the shared Tim Gabaree website framework.
|
| Every public PHP page should require this file before producing any
| HTML output.
|
*/

/*
|--------------------------------------------------------------------------
| Load Core Configuration
|--------------------------------------------------------------------------
|
| Load order matters:
|
| 1. config.php defines site-specific values.
| 2. constants.php defines application-level values.
| 3. version.php defines cache-busting versions.
| 4. images.php defines the central site image registry.
| 5. functions.php defines shared helper functions.
|
*/

require_once __DIR__ .
    '/config.php';

require_once __DIR__ .
    '/constants.php';

require_once __DIR__ .
    '/version.php';

require_once __DIR__ .
    '/images/images.php';

require_once __DIR__ .
    '/functions.php';

/*
|--------------------------------------------------------------------------
| HTTP Security Headers
|--------------------------------------------------------------------------
*/

sendSecurityHeaders();

/*
|--------------------------------------------------------------------------
| Error Reporting
|--------------------------------------------------------------------------
|
| Log all PHP errors in every environment.
| Display them only when application debugging is enabled.
|
*/

error_reporting(
    E_ALL
);

ini_set(
    'display_errors',
    APP_DEBUG
        ? '1'
        : '0'
);

ini_set(
    'log_errors',
    '1'
);

/*
|--------------------------------------------------------------------------
| Timezone
|--------------------------------------------------------------------------
*/

date_default_timezone_set(
    SITE_TIMEZONE
);

/*
|--------------------------------------------------------------------------
| Character Encoding
|--------------------------------------------------------------------------
*/

if (
    function_exists(
        'mb_internal_encoding'
    )
) {
    mb_internal_encoding(
        APP_CHARSET
    );
}

/*
|--------------------------------------------------------------------------
| Session Initialization
|--------------------------------------------------------------------------
|
| Sessions are started explicitly with startApplicationSession() only by
| requests that require CSRF, rate-limiting, or conversion session state.
|
*/

/*
|--------------------------------------------------------------------------
| Security Services
|--------------------------------------------------------------------------
*/

require_once __DIR__ .
    '/security/security-csrf.php';

require_once __DIR__ .
    '/security/security-rate-limit.php';

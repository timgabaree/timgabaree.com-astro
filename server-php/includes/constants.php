<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Application Constants
|--------------------------------------------------------------------------
|
| Stable values used throughout the Tim Gabaree website.
|
| Personal information, contact details, URLs, document links, social
| profiles, and analytics IDs belong in config.php. Asset versions belong
| in version.php.
|
*/

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

const APP_DEBUG =
    false;

/*
|--------------------------------------------------------------------------
| Character Encoding
|--------------------------------------------------------------------------
*/

const APP_CHARSET =
    'UTF-8';

/*
|--------------------------------------------------------------------------
| Date and Time
|--------------------------------------------------------------------------
*/

const APP_DATETIME_FORMAT =
    'F j, Y \a\t g:i a';

/*
|--------------------------------------------------------------------------
| Contact Form Limits
|--------------------------------------------------------------------------
*/

const CONTACT_FORM_MAX_REQUEST_BYTES =
    51200;

const CONTACT_FORM_MINIMUM_SECONDS_BETWEEN_SUBMISSIONS =
    15;

const CONTACT_FORM_IP_RATE_LIMIT_MAX_ATTEMPTS =
    5;

const CONTACT_FORM_IP_RATE_LIMIT_WINDOW_SECONDS =
    600;

const CONTACT_FORM_RATE_LIMIT_ACTION =
    'contact_form_submission';

const CONTACT_FORM_NAME_MAX_LENGTH =
    100;

const CONTACT_FORM_ORGANIZATION_MAX_LENGTH =
    150;

const CONTACT_FORM_EMAIL_MAX_LENGTH =
    254;

const CONTACT_FORM_PHONE_MAX_LENGTH =
    40;

const CONTACT_FORM_MESSAGE_MAX_LENGTH =
    5000;

const CONTACT_FORM_REMOTE_ADDRESS_MAX_LENGTH =
    45;

const CONTACT_FORM_USER_AGENT_MAX_LENGTH =
    500;

/*
|--------------------------------------------------------------------------
| Contact Form Status Values
|--------------------------------------------------------------------------
*/

const CONTACT_STATUS_MISSING =
    'missing';

const CONTACT_STATUS_INVALID =
    'invalid';

const CONTACT_STATUS_INVALID_EMAIL =
    'invalid-email';

const CONTACT_STATUS_RATE_LIMITED =
    'rate-limited';

const CONTACT_STATUS_SECURITY_ERROR =
    'security-error';

const CONTACT_STATUS_SEND_ERROR =
    'send-error';

/*
|--------------------------------------------------------------------------
| Session Keys
|--------------------------------------------------------------------------
*/

const SESSION_CSRF_TOKEN_KEY =
    'timgabaree_csrf_token';

const SESSION_RATE_LIMIT_KEY =
    'timgabaree_rate_limit';

const SESSION_CONTACT_CONVERSION_KEY =
    'timgabaree_contact_conversion';

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

const CSRF_TOKEN_BYTES =
    32;

const SESSION_COOKIE_SECURE =
    true;

const SESSION_COOKIE_HTTP_ONLY =
    true;

const SESSION_COOKIE_SAME_SITE =
    'Lax';

/*
|--------------------------------------------------------------------------
| Mail
|--------------------------------------------------------------------------
*/

const MAIL_LINE_ENDING =
    "\r\n";

const MAIL_SUBJECT_PREFIX =
    '[Tim Gabaree Website]';

/*
|--------------------------------------------------------------------------
| Schema.org
|--------------------------------------------------------------------------
*/

const SCHEMA_CONTEXT =
    'https://schema.org';

/*
|--------------------------------------------------------------------------
| HTTP Response Codes
|--------------------------------------------------------------------------
*/

const HTTP_STATUS_SEE_OTHER =
    303;

const HTTP_STATUS_FORBIDDEN =
    403;

const HTTP_STATUS_NOT_FOUND =
    404;

const HTTP_STATUS_INTERNAL_SERVER_ERROR =
    500;

<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Tim Gabaree Contact Form Handler
|--------------------------------------------------------------------------
|
| Protected handler:
|
| /includes/forms/form-contact-handler.php
|
| Public endpoint:
|
| /contact-submit
|
| This file coordinates request validation, CSRF protection, rate
| limiting, form validation, mail delivery, and redirects.
|
*/

require_once dirname(__DIR__) .
    '/bootstrap.php';

require_once __DIR__ .
    '/form-contact-topics.php';

require_once __DIR__ .
    '/form-validation.php';

require_once __DIR__ .
    '/form-mail.php';

startApplicationSession();

/*
|--------------------------------------------------------------------------
| Response Headers
|--------------------------------------------------------------------------
*/

header(
    'Cache-Control: no-store, no-cache, must-revalidate, max-age=0'
);

header(
    'Pragma: no-cache'
);

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

$recipientEmail =
    SITE_FORM_EMAIL;

$senderEmail =
    SITE_FORM_SENDER_EMAIL;

$senderName =
    SITE_FORM_SENDER_NAME;

$contactUrl =
    SITE_CONTACT_PATH;

$thankYouUrl =
    SITE_THANK_YOU_PATH;

/*
|--------------------------------------------------------------------------
| Accept POST Requests Only
|--------------------------------------------------------------------------
*/

if (
    requestMethod() !== 'POST'
) {
    redirectTo(
        $contactUrl
    );
}

/*
|--------------------------------------------------------------------------
| Same-Site Request Check
|--------------------------------------------------------------------------
|
| This is supplemental protection. CSRF validation remains the primary
| request-authenticity control.
|
*/

if (
    !requestAppearsSameSite()
) {
    error_log(
        'Tim Gabaree contact form: rejected cross-site submission.'
    );

    redirectToContactStatus(
        CONTACT_STATUS_INVALID
    );
}

/*
|--------------------------------------------------------------------------
| Request Size
|--------------------------------------------------------------------------
*/

$contentLength =
    $_SERVER['CONTENT_LENGTH'] ??
    0;

if (
    is_string($contentLength) ||
    is_int($contentLength) ||
    is_float($contentLength)
) {
    $contentLength =
        (int) $contentLength;
} else {
    $contentLength =
        0;
}

if (
    $contentLength < 0 ||
    $contentLength >
        CONTACT_FORM_MAX_REQUEST_BYTES
) {
    redirectToContactStatus(
        CONTACT_STATUS_INVALID
    );
}

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

if (
    !rateLimitAllows(
        CONTACT_FORM_RATE_LIMIT_ACTION,
        CONTACT_FORM_MINIMUM_SECONDS_BETWEEN_SUBMISSIONS
    )
) {
    redirectToContactStatus(
        CONTACT_STATUS_RATE_LIMITED
    );
}

/*
|--------------------------------------------------------------------------
| Honeypot
|--------------------------------------------------------------------------
|
| Legitimate visitors should leave this hidden field empty.
|
| Treat a populated honeypot as a successful submission from the
| visitor's perspective without sending mail.
|
*/

$honeypot =
    normalizeSingleLineInput(
        postString(
            'website'
        )
    );

if ($honeypot !== '') {

    rateLimitRecord(
        CONTACT_FORM_RATE_LIMIT_ACTION
    );

    redirectTo(
        $thankYouUrl
    );
}

/*
|--------------------------------------------------------------------------
| CSRF Validation
|--------------------------------------------------------------------------
*/

$submittedCsrfToken =
    postString(
        'csrf_token'
    );

if (
    !csrfIsValid(
        $submittedCsrfToken
    )
) {
    error_log(
        'Tim Gabaree contact form: invalid CSRF token.'
    );

    redirectToContactStatus(
        CONTACT_STATUS_SECURITY_ERROR
    );
}

/*
|--------------------------------------------------------------------------
| Remote-Address Rate Limiting
|--------------------------------------------------------------------------
*/

if (
    !ipRateLimitAllowsAndRecord(
        CONTACT_FORM_RATE_LIMIT_ACTION,
        CONTACT_FORM_IP_RATE_LIMIT_MAX_ATTEMPTS,
        CONTACT_FORM_IP_RATE_LIMIT_WINDOW_SECONDS
    )
) {
    redirectToContactStatus(
        CONTACT_STATUS_RATE_LIMITED
    );
}

/*
|--------------------------------------------------------------------------
| Validate Form Data
|--------------------------------------------------------------------------
*/

$validationResult =
    validateContactForm(
        $contactTopics
    );

$isValid =
    $validationResult['is_valid'] ??
    false;

if ($isValid !== true) {

    $status =
        $validationResult['status'] ??
        CONTACT_STATUS_INVALID;

    if (
        !is_string($status) ||
        $status === ''
    ) {
        $status =
            CONTACT_STATUS_INVALID;
    }

    redirectToContactStatus(
        $status
    );
}

$formData =
    $validationResult['data'] ??
    [];

if (
    !is_array(
        $formData
    )
) {
    redirectToContactStatus(
        CONTACT_STATUS_INVALID
    );
}

/*
|--------------------------------------------------------------------------
| Send Mail
|--------------------------------------------------------------------------
*/

$mailSent =
    sendContactMail(
        $formData,
        $recipientEmail,
        $senderEmail,
        $senderName
    );

if ($mailSent) {

/*
|--------------------------------------------------------------------------
| Successful Submission
|--------------------------------------------------------------------------
|
| Record the successful submission and invalidate the CSRF token that was
| just used.
|
*/

    rateLimitRecord(
        CONTACT_FORM_RATE_LIMIT_ACTION
    );

    csrfRotateToken();

/*
|--------------------------------------------------------------------------
| Analytics Conversion Flag
|--------------------------------------------------------------------------
|
| Record a one-time session flag so the thank-you page can distinguish
| a genuine contact-form conversion from a direct page visit.
|
*/

    $_SESSION[
        SESSION_CONTACT_CONVERSION_KEY
    ] =
        true;

    redirectTo(
        $thankYouUrl
    );
}

/*
|--------------------------------------------------------------------------
| Mail Failure
|--------------------------------------------------------------------------
*/

error_log(
    'Tim Gabaree contact form: mail() returned false.'
);

redirectToContactStatus(
    CONTACT_STATUS_SEND_ERROR
);

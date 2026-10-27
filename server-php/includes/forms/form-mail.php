<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Contact Form Mail Service
|--------------------------------------------------------------------------
|
| Builds and sends the plain-text contact-form email.
|
| Request validation, POST handling, CSRF protection, and rate limiting
| are handled elsewhere.
|
*/

/*
|--------------------------------------------------------------------------
| Mail Header Encoding
|--------------------------------------------------------------------------
|
| Encode a mail-header value when multibyte support is available.
|
*/

function encodeMailHeader(
    string $value
): string {
    if (
        function_exists(
            'mb_encode_mimeheader'
        )
    ) {
        return mb_encode_mimeheader(
            $value,
            APP_CHARSET,
            'B',
            MAIL_LINE_ENDING
        );
    }

    return $value;
}

/*
|--------------------------------------------------------------------------
| Mail Configuration Validation
|--------------------------------------------------------------------------
|
| Determine whether the configured recipient and sender values are safe
| for use in mail headers.
|
*/

function contactMailConfigurationIsValid(
    string $recipientEmail,
    string $senderEmail,
    string $senderName
): bool {
    $recipientEmail =
        trim($recipientEmail);

    $senderEmail =
        trim($senderEmail);

    $senderName =
        normalizeSingleLineInput(
            $senderName
        );

    if (
        $recipientEmail === '' ||
        $senderEmail === '' ||
        $senderName === ''
    ) {
        return false;
    }

    if (
        !emailIsValid(
            $recipientEmail
        ) ||
        !emailIsValid(
            $senderEmail
        )
    ) {
        return false;
    }

    if (
        containsHeaderInjection(
            $recipientEmail
        ) ||
        containsHeaderInjection(
            $senderEmail
        ) ||
        containsHeaderInjection(
            $senderName
        )
    ) {
        return false;
    }

    return true;
}

/*
|--------------------------------------------------------------------------
| Subject Construction
|--------------------------------------------------------------------------
|
| Build the contact-form email subject.
|
*/

function buildContactMailSubject(
    string $topicLabel
): string {
    $topicLabel =
        normalizeSingleLineInput(
            $topicLabel
        );

    if ($topicLabel === '') {
        $topicLabel =
            'Website Inquiry';
    }

    return encodeMailHeader(
        MAIL_SUBJECT_PREFIX .
        ' ' .
        $topicLabel
    );
}

/*
|--------------------------------------------------------------------------
| Message Body Construction
|--------------------------------------------------------------------------
|
| Build the plain-text contact-form email body.
|
*/

function buildContactMailBody(
    array $formData
): string {
    $name =
        $formData['name'] ??
        '';

    $organization =
        $formData['organization'] ??
        '';

    $email =
        $formData['email'] ??
        '';

    $phone =
        $formData['phone'] ??
        '';

    $topicLabel =
        $formData['topic_label'] ??
        '';

    $message =
        $formData['message'] ??
        '';

    $remoteAddress =
        $_SERVER['REMOTE_ADDR'] ??
        'Unavailable';

    $userAgent =
        $_SERVER['HTTP_USER_AGENT'] ??
        'Unavailable';

    if (!is_string($remoteAddress)) {
        $remoteAddress =
            'Unavailable';
    }

    if (!is_string($userAgent)) {
        $userAgent =
            'Unavailable';
    }

    $remoteAddress =
        sanitizeLogValue(
            $remoteAddress,
            CONTACT_FORM_REMOTE_ADDRESS_MAX_LENGTH
        );

    $userAgent =
        sanitizeLogValue(
            $userAgent,
            CONTACT_FORM_USER_AGENT_MAX_LENGTH
        );

    $lines = [
        SITE_NAME .
            ' Website Contact Form',

        str_repeat(
            '=',
            48
        ),

        '',

        'Name:',
        $name,

        '',

        'Organization:',
        $organization !== ''
            ? $organization
            : 'Not provided',

        '',

        'Email:',
        $email,

        '',

        'Phone:',
        $phone !== ''
            ? $phone
            : 'Not provided',

        '',

        'Topic:',
        $topicLabel,

        '',

        'Message:',
        $message,

        '',

        str_repeat(
            '-',
            48
        ),

        '',

        'Submitted:',
        date(
            APP_DATETIME_FORMAT
        ) .
            ' ' .
            date('T'),

        '',

        'IP Address:',
        $remoteAddress,

        '',

        'User Agent:',
        $userAgent,
    ];

    return implode(
        MAIL_LINE_ENDING,
        $lines
    );
}

/*
|--------------------------------------------------------------------------
| Mail Header Construction
|--------------------------------------------------------------------------
|
| Build the mail headers.
|
*/

function buildContactMailHeaders(
    array $formData,
    string $senderEmail,
    string $senderName
): array {
    $replyToEmail =
        $formData['email'] ??
        '';

    $replyToName =
        $formData['name'] ??
        '';

    $senderName =
        normalizeSingleLineInput(
            $senderName
        );

    $headers = [
        'MIME-Version: 1.0',

        'Content-Type: text/plain; charset=' .
            APP_CHARSET,

        'Content-Transfer-Encoding: 8bit',

        'From: ' .
            encodeMailHeader(
                $senderName
            ) .
            ' <' .
            $senderEmail .
            '>',

        'X-Mailer: ' .
            SITE_NAME .
            ' Contact Form',
    ];

    if (
        is_string($replyToEmail) &&
        is_string($replyToName) &&
        emailIsValid(
            $replyToEmail
        ) &&
        !containsHeaderInjection(
            $replyToEmail
        ) &&
        !containsHeaderInjection(
            $replyToName
        )
    ) {
        $replyToName =
            normalizeSingleLineInput(
                $replyToName
            );

        $headers[] =
            'Reply-To: ' .
            encodeMailHeader(
                $replyToName
            ) .
            ' <' .
            $replyToEmail .
            '>';
    }

    return $headers;
}

/*
|--------------------------------------------------------------------------
| Send Contact Mail
|--------------------------------------------------------------------------
|
| Send a validated contact-form submission.
|
*/

function sendContactMail(
    array $formData,
    string $recipientEmail,
    string $senderEmail,
    string $senderName
): bool {
    if (PHP_SAPI === 'cli-server' && defined('CONTACT_LOCAL_PREVIEW')) {
        return false;
    }

    $recipientEmail =
        trim($recipientEmail);

    $senderEmail =
        trim($senderEmail);

    $senderName =
        normalizeSingleLineInput(
            $senderName
        );

    if (
        !contactMailConfigurationIsValid(
            $recipientEmail,
            $senderEmail,
            $senderName
        )
    ) {
        error_log(
            SITE_NAME .
            ' contact form: invalid mail configuration.'
        );

        return false;
    }

    $topicLabel =
        $formData['topic_label'] ??
        'Website Inquiry';

    $subject =
        buildContactMailSubject(
            is_string($topicLabel)
                ? $topicLabel
                : 'Website Inquiry'
        );

    $body =
        buildContactMailBody(
            $formData
        );

    $headers =
        buildContactMailHeaders(
            $formData,
            $senderEmail,
            $senderName
        );

/*
|--------------------------------------------------------------------------
| Mail Transport Compatibility
|--------------------------------------------------------------------------
|
| Keep the current four-argument mail() behavior while the existing
| GoDaddy mail transport is known to be working correctly.
|
*/

    return mail(
        $recipientEmail,
        $subject,
        $body,
        implode(
            MAIL_LINE_ENDING,
            $headers
        )
    );
}

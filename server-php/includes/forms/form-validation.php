<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Contact Form Validation
|--------------------------------------------------------------------------
|
| Validates and normalizes submitted contact-form data.
|
| Shared input normalization, email validation, length checking, and
| header-injection protection are provided by functions.php.
|
| This file contains only validation behavior specific to the contact
| form.
|
*/

/*
|--------------------------------------------------------------------------
| Validate Contact Form Submission
|--------------------------------------------------------------------------
|
| Validate and normalize a contact-form submission.
|
| Returns:
|
| [
|     'is_valid' => bool,
|     'status'    => string,
|     'data'      => array
| ]
|
| Status values are defined centrally in constants.php.
|
*/

function validateContactForm(
    array $contactTopics
): array {
    $name =
        normalizeSingleLineInput(
            postString(
                'name'
            )
        );

    $organization =
        normalizeSingleLineInput(
            postString(
                'organization'
            )
        );

    $email =
        normalizeSingleLineInput(
            postString(
                'email'
            )
        );

    $phone =
        normalizeSingleLineInput(
            postString(
                'phone'
            )
        );

    $topic =
        normalizeSingleLineInput(
            postString(
                'topic'
            )
        );

    $message =
        normalizeMultilineInput(
            postString(
                'message'
            )
        );

/*
|--------------------------------------------------------------------------
| Required Fields
|--------------------------------------------------------------------------
*/

    if (
        $name === '' ||
        $email === '' ||
        $topic === '' ||
        $message === ''
    ) {
        return [
            'is_valid' => false,

            'status' => CONTACT_STATUS_MISSING,

            'data' => [],
        ];
    }

/*
|--------------------------------------------------------------------------
| Field Lengths
|--------------------------------------------------------------------------
*/

    if (
        textExceedsLength(
            $name,
            CONTACT_FORM_NAME_MAX_LENGTH
        ) ||
        textExceedsLength(
            $organization,
            CONTACT_FORM_ORGANIZATION_MAX_LENGTH
        ) ||
        textExceedsLength(
            $email,
            CONTACT_FORM_EMAIL_MAX_LENGTH
        ) ||
        textExceedsLength(
            $phone,
            CONTACT_FORM_PHONE_MAX_LENGTH
        ) ||
        textExceedsLength(
            $message,
            CONTACT_FORM_MESSAGE_MAX_LENGTH
        )
    ) {
        return [
            'is_valid' => false,

            'status' => CONTACT_STATUS_INVALID,

            'data' => [],
        ];
    }

/*
|--------------------------------------------------------------------------
| Email Address
|--------------------------------------------------------------------------
*/

    if (
        !emailIsValid(
            $email
        )
    ) {
        return [
            'is_valid' => false,

            'status' => CONTACT_STATUS_INVALID_EMAIL,

            'data' => [],
        ];
    }

/*
|--------------------------------------------------------------------------
| Header-Injection Protection
|--------------------------------------------------------------------------
*/

    if (
        containsHeaderInjection(
            $name
        ) ||
        containsHeaderInjection(
            $organization
        ) ||
        containsHeaderInjection(
            $email
        ) ||
        containsHeaderInjection(
            $phone
        ) ||
        containsHeaderInjection(
            $topic
        )
    ) {
        return [
            'is_valid' => false,

            'status' => CONTACT_STATUS_INVALID,

            'data' => [],
        ];
    }

/*
|--------------------------------------------------------------------------
| Topic Allowlist
|--------------------------------------------------------------------------
*/

    if (
        !array_key_exists(
            $topic,
            $contactTopics
        )
    ) {
        return [
            'is_valid' => false,

            'status' => CONTACT_STATUS_INVALID,

            'data' => [],
        ];
    }

    $topicLabel =
        $contactTopics[$topic];

    if (
        !is_string(
            $topicLabel
        ) ||
        $topicLabel === ''
    ) {
        return [
            'is_valid' => false,

            'status' => CONTACT_STATUS_INVALID,

            'data' => [],
        ];
    }

/*
|--------------------------------------------------------------------------
| Validated Data
|--------------------------------------------------------------------------
*/

    return [
        'is_valid' => true,

        'status' => '',

        'data' => [
            'name' => $name,

            'organization' => $organization,

            'email' => $email,

            'phone' => $phone,

            'topic' => $topic,

            'topic_label' => $topicLabel,

            'message' => $message,
        ],
    ];
}

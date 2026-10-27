<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Session-Based Rate Limiting
|--------------------------------------------------------------------------
|
| Provides lightweight rate limiting for public forms.
|
| Callers must initialize the application session with
| startApplicationSession() before using these functions.
|
*/

/*
|--------------------------------------------------------------------------
| Normalize Rate-Limit Storage Key
|--------------------------------------------------------------------------
|
| Return the session key used for a rate-limited action.
|
*/

function rateLimitSessionKey(
    string $action
): string {
    $normalizedAction =
        preg_replace(
            '/[^a-z0-9_-]+/i',
            '_',
            strtolower(
                trim($action)
            )
        );

    if (
        !is_string($normalizedAction) ||
        $normalizedAction === ''
    ) {
        $normalizedAction =
            'default';
    }

    return SESSION_RATE_LIMIT_KEY .
        ':' .
        $normalizedAction;
}

/*
|--------------------------------------------------------------------------
| Last Recorded Action
|--------------------------------------------------------------------------
|
| Return the timestamp of the last recorded action.
|
*/

function rateLimitLastTimestamp(
    string $action
): ?int {
    $sessionKey =
        rateLimitSessionKey(
            $action
        );

    if (
        !isset($_SESSION[$sessionKey])
    ) {
        return null;
    }

    $timestamp =
        $_SESSION[$sessionKey];

    if (
        is_int($timestamp)
    ) {
        return $timestamp;
    }

    if (
        is_numeric($timestamp)
    ) {
        return (int) $timestamp;
    }

    return null;
}

/*
|--------------------------------------------------------------------------
| Check Whether Action Is Allowed
|--------------------------------------------------------------------------
|
| Determine whether the action may proceed.
|
*/

function rateLimitAllows(
    string $action,
    int $minimumSeconds
): bool {

    if (
        $minimumSeconds <= 0
    ) {
        return true;
    }

    $lastTimestamp =
        rateLimitLastTimestamp(
            $action
        );

    if (
        $lastTimestamp === null
    ) {
        return true;
    }

    return (
        time() -
        $lastTimestamp
    ) >=
        $minimumSeconds;
}

/*
|--------------------------------------------------------------------------
| Record Action
|--------------------------------------------------------------------------
|
| Record that a rate-limited action occurred.
|
*/

function rateLimitRecord(
    string $action,
    ?int $timestamp = null
): void {

    $_SESSION[
        rateLimitSessionKey(
            $action
        )
    ] =
        $timestamp ??
        time();
}

/*
|--------------------------------------------------------------------------
| Remote-Address Rate Limiting
|--------------------------------------------------------------------------
|
| Provide lightweight server-side abuse resistance in addition to the
| browser-session submission throttle above.
|
| Only a SHA-256-derived request key and recent timestamps are retained.
| State is automatically pruned after the configured rate-limit window.
|
| REMOTE_ADDR is used directly. Forwarded-client headers are intentionally
| not trusted.
|
*/

function rateLimitRemoteAddressKey(
    string $action
): ?string {
    $remoteAddress =
        $_SERVER['REMOTE_ADDR'] ??
        '';

    if (!is_string($remoteAddress)) {
        return null;
    }

    $remoteAddress =
        trim($remoteAddress);

    if (
        $remoteAddress === '' ||
        filter_var(
            $remoteAddress,
            FILTER_VALIDATE_IP
        ) === false
    ) {
        return null;
    }

    return hash(
        'sha256',
        $action .
            "\0" .
            $remoteAddress
    );
}

function rateLimitStoragePath(): string
{
    return dirname(
        __DIR__,
        2
    ) .
        '/tmp/contact-rate-limit.json';
}

function ipRateLimitAllowsAndRecord(
    string $action,
    int $maximumAttempts,
    int $windowSeconds
): bool {
    if (
        $maximumAttempts <= 0 ||
        $windowSeconds <= 0
    ) {
        return true;
    }

    $rateLimitKey =
        rateLimitRemoteAddressKey(
            $action
        );

    if ($rateLimitKey === null) {
        return true;
    }

    $storagePath =
        rateLimitStoragePath();

    $storageDirectory =
        dirname(
            $storagePath
        );

    if (
        !is_dir(
            $storageDirectory
        ) &&
        !@mkdir(
            $storageDirectory,
            0750,
            true
        ) &&
        !is_dir(
            $storageDirectory
        )
    ) {
        error_log(
            'Contact rate limit: unable to initialize runtime storage.'
        );

        return true;
    }

    $handle =
        @fopen(
            $storagePath,
            'c+'
        );

    if ($handle === false) {
        error_log(
            'Contact rate limit: unable to open runtime storage.'
        );

        return true;
    }

    @chmod(
        $storagePath,
        0600
    );

    $allowed =
        true;

    try {
        if (
            !flock(
                $handle,
                LOCK_EX
            )
        ) {
            error_log(
                'Contact rate limit: unable to lock runtime storage.'
            );

            return true;
        }

        rewind(
            $handle
        );

        $serializedState =
            stream_get_contents(
                $handle
            );

        $state =
            [];

        if (
            is_string(
                $serializedState
            ) &&
            trim(
                $serializedState
            ) !== ''
        ) {
            $decodedState =
                json_decode(
                    $serializedState,
                    true
                );

            if (
                is_array(
                    $decodedState
                )
            ) {
                $state =
                    $decodedState;
            }
        }

        $now =
            time();

        $cutoff =
            $now -
            $windowSeconds;

        $prunedState =
            [];

        foreach (
            $state as
            $storedKey => $timestamps
        ) {
            if (
                !is_string(
                    $storedKey
                ) ||
                !is_array(
                    $timestamps
                )
            ) {
                continue;
            }

            $recentTimestamps =
                [];

            foreach (
                $timestamps as
                $timestamp
            ) {
                if (
                    is_int(
                        $timestamp
                    ) ||
                    is_numeric(
                        $timestamp
                    )
                ) {
                    $timestamp =
                        (int) $timestamp;

                    if (
                        $timestamp >=
                        $cutoff
                    ) {
                        $recentTimestamps[] =
                            $timestamp;
                    }
                }
            }

            if (
                $recentTimestamps !== []
            ) {
                $prunedState[
                    $storedKey
                ] =
                    $recentTimestamps;
            }
        }

        $attempts =
            $prunedState[
                $rateLimitKey
            ] ??
            [];

        if (
            count(
                $attempts
            ) >=
            $maximumAttempts
        ) {
            $allowed =
                false;
        } else {
            $attempts[] =
                $now;

            $prunedState[
                $rateLimitKey
            ] =
                $attempts;
        }

        $encodedState =
            json_encode(
                $prunedState,
                JSON_UNESCAPED_SLASHES
            );

        if (
            !is_string(
                $encodedState
            )
        ) {
            error_log(
                'Contact rate limit: unable to encode runtime state.'
            );

            return true;
        }

        rewind(
            $handle
        );

        if (
            !ftruncate(
                $handle,
                0
            ) ||
            fwrite(
                $handle,
                $encodedState
            ) === false ||
            !fflush(
                $handle
            )
        ) {
            error_log(
                'Contact rate limit: unable to persist runtime state.'
            );

            return true;
        }

        return $allowed;
    } finally {
        flock(
            $handle,
            LOCK_UN
        );

        fclose(
            $handle
        );
    }
}

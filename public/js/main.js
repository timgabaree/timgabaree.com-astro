'use strict';

/*
|--------------------------------------------------------------------------
| Website JavaScript
|--------------------------------------------------------------------------
|
| Shared client-side behavior for timgabaree.com.
|
| Reusable site-wide JavaScript belongs in this file rather than being
| embedded directly in PHP pages or shared components.
|
*/

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
|
| Provides the site's responsive navigation and dropdown behavior without
| requiring the legacy Bootstrap JavaScript, jQuery, or Popper libraries.
|
*/

document.addEventListener(
    'DOMContentLoaded',
    () => {
        const toggler =
            document.querySelector(
                '.navbar-toggler'
            );

        const nav =
            document.querySelector(
                '#navbarNav'
            );

        const dropdownButtons =
            document.querySelectorAll(
                '.dropdown-toggle'
            );

        /*
         * The navigation controls are not present on every possible page.
         * Exit cleanly when the required navigation elements do not exist.
         */
        if (!toggler || !nav) {
            return;
        }

        /*
         * Close all dropdown menus.
         */
        const closeDropdowns =
            () => {
                dropdownButtons.forEach(
                    (button) => {
                        button.setAttribute(
                            'aria-expanded',
                            'false'
                        );

                        button
                            .nextElementSibling
                            ?.classList.remove(
                                'show'
                            );
                    }
                );
            };

        /*
         * Close the mobile navigation and all dropdown menus.
         */
        const closeNavigation =
            () => {
                nav.classList.remove(
                    'show'
                );

                toggler.setAttribute(
                    'aria-expanded',
                    'false'
                );

                closeDropdowns();
            };

        /*
         * Toggle the mobile navigation menu.
         */
        toggler.addEventListener(
            'click',
            () => {
                const expanded =
                    toggler.getAttribute(
                        'aria-expanded'
                    ) === 'true';

                toggler.setAttribute(
                    'aria-expanded',
                    String(!expanded)
                );

                nav.classList.toggle(
                    'show'
                );
            }
        );

        /*
         * Toggle individual dropdown menus.
         *
         * Opening one dropdown closes any other open dropdown.
         */
        dropdownButtons.forEach(
            (button) => {
                button.addEventListener(
                    'click',
                    (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        const expanded =
                            button.getAttribute(
                                'aria-expanded'
                            ) === 'true';

                        dropdownButtons.forEach(
                            (otherButton) => {
                                if (
                                    otherButton !==
                                    button
                                ) {
                                    otherButton.setAttribute(
                                        'aria-expanded',
                                        'false'
                                    );

                                    otherButton
                                        .nextElementSibling
                                        ?.classList.remove(
                                            'show'
                                        );
                                }
                            }
                        );

                        button.setAttribute(
                            'aria-expanded',
                            String(!expanded)
                        );

                        button
                            .nextElementSibling
                            ?.classList.toggle(
                                'show'
                            );
                    }
                );
            }
        );

        /*
         * Close the mobile navigation and all dropdowns after a
         * navigation link is selected.
         */
        document
            .querySelectorAll(
                '.navbar a'
            )
            .forEach(
                (link) => {
                    link.addEventListener(
                        'click',
                        () => {
                            closeNavigation();
                        }
                    );
                }
            );

        /*
         * Close open dropdowns when the visitor clicks elsewhere
         * on the page.
         */
        document.addEventListener(
            'click',
            (event) => {
                if (
                    !event.target.closest(
                        '.dropdown'
                    )
                ) {
                    closeDropdowns();
                }
            }
        );

        /*
         * Close open navigation controls with Escape.
         *
         * Return focus to the dropdown button that owns the focused
         * dropdown, or to the mobile navigation toggle otherwise.
         */
        document.addEventListener(
            'keydown',
            (event) => {
                if (event.key !== 'Escape') {
                    return;
                }

                const focusedDropdown =
                    document.activeElement
                        ?.closest(
                            '.dropdown'
                        );

                const dropdownButton =
                    focusedDropdown
                        ?.querySelector(
                            '.dropdown-toggle'
                        );

                const navigationWasOpen =
                    nav.classList.contains(
                        'show'
                    );

                const dropdownWasOpen =
                    Array.from(
                        dropdownButtons
                    ).some(
                        (button) =>
                            button.getAttribute(
                                'aria-expanded'
                            ) === 'true'
                    );

                if (
                    dropdownWasOpen
                ) {
                    closeDropdowns();

                    if (dropdownButton) {
                        dropdownButton.focus();
                    }

                    return;
                }

                if (!navigationWasOpen) {
                    return;
                }

                closeNavigation();
                toggler.focus();
            }
        );
    }
);

/*
|--------------------------------------------------------------------------
| Contact Form Status Message
|--------------------------------------------------------------------------
|
| Contact-form redirects may include a status query parameter such as:
|
|     /contact?status=rate-limited
|
| PHP uses that value to display a visitor-facing status message.
|
| The message remains visible briefly and is then removed. The status
| parameter is also removed from the browser URL so refreshing the page
| does not display a stale message.
|
| This behavior is cosmetic only. It does not alter or bypass the
| server-side contact-form rate limiting or validation.
|
*/

document.addEventListener(
    'DOMContentLoaded',
    () => {
        const statusMessage =
            document.querySelector(
                '.contact-form-status-message'
            );

        /*
         * Nothing to do when the current page does not contain a
         * contact-form status message.
         */
        if (!statusMessage) {
            return;
        }

        /*
         * Keep the message visible for six seconds before removing it.
         */
        window.setTimeout(
            () => {
                statusMessage.remove();

                /*
                 * Remove only the contact-form status parameter while
                 * preserving other query parameters and URL fragments.
                 */
                const url =
                    new URL(
                        window.location.href
                    );

                url.searchParams.delete(
                    'status'
                );

                /*
                 * Update the displayed URL without reloading the page.
                 */
                window.history.replaceState(
                    {},
                    document.title,
                    url.pathname +
                        url.search +
                        url.hash
                );
            },
            6000
        );
    }
);
<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Site Image Registry
|--------------------------------------------------------------------------
|
| Central source of truth for managed site images.
|
| Add, remove, rename, or update important site images here.
|
| Image definitions are shared across HTML rendering, metadata,
| structured data, preload logic, and sitemap generation.
|
| The optional roles array is reserved for behavior that requires explicit
| authorization. Currently, the sitemap role approves an image for sitemap
| inclusion.
|
*/

const SITE_IMAGES = [

/*
|--------------------------------------------------------------------------
| Primary Profile Image
|--------------------------------------------------------------------------
*/

    'profile' => [
        'path' => '/media/profile-pic-tim-gabaree-900x1200.webp',

        'width' => 900,

        'height' => 1200,

        'alt' => 'Portrait of Tim',

        'description' =>
            'Head-and-shoulders professional portrait of Tim smiling at the camera. He has short gray and light-brown hair and rectangular dark-framed glasses, and wears a light blue collared shirt beneath a dark blazer. The softly blurred background shows a bright indoor setting.',

        'loading' => 'eager',

        'fetchpriority' => 'high',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Social Icon — Blogger
|--------------------------------------------------------------------------
*/

    'social_blogger' => [
        'path' => '/media/social-media-blogger-icon-50x50.webp',

        'width' => 50,

        'height' => 50,

        'alt' => '',
    ],

/*
|--------------------------------------------------------------------------
| Social Icon — LinkedIn
|--------------------------------------------------------------------------
*/

    'social_linkedin' => [
        'path' => '/media/social-media-linkedin-icon-50x50.webp',

        'width' => 50,

        'height' => 50,

        'alt' => '',
    ],

/*
|--------------------------------------------------------------------------
| Social Icon — GitHub
|--------------------------------------------------------------------------
*/

    'social_github' => [
        'path' => '/media/social-media-github-icon-50x50.webp',

        'width' => 50,

        'height' => 50,

        'alt' => '',
    ],

/*
|--------------------------------------------------------------------------
| Home Hover Profile Image
|--------------------------------------------------------------------------
*/

    'profile_hover' => [
        'path' => '/media/profile-pic-tim-gabaree-in-the-morning-400x534.webp',

        'width' => 400,

        'height' => 534,

        'alt' => '',

        'loading' => 'eager',

        'fetchpriority' => 'high',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Results Background — Left
|--------------------------------------------------------------------------
*/

    'results_left' => [
        'path' => '/media/results-background-left-850x1050.webp',

        'width' => 850,

        'height' => 1050,

        'alt' => '',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Results Background — Middle
|--------------------------------------------------------------------------
*/

    'results_middle' => [
        'path' => '/media/results-background-middle-850x1050.webp',

        'width' => 850,

        'height' => 1050,

        'alt' => '',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Results Background — Right
|--------------------------------------------------------------------------
*/

    'results_right' => [
        'path' => '/media/results-background-right-850x1050.webp',

        'width' => 850,

        'height' => 1050,

        'alt' => '',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Expertise Background
|--------------------------------------------------------------------------
*/

    'expertise' => [
        'path' => '/media/expertise-background-650x752.webp',

        'width' => 650,

        'height' => 752,

        'alt' => '',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Education — Background Image — University of Illinois Springfield
|--------------------------------------------------------------------------
*/

    'education_uis_background' => [
        'path' => '/media/education-background-university-of-illinois-springfield-1200x313.webp',

        'width' => 1200,

        'height' => 313,

        'alt' => '',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Education Logo — University of Illinois Springfield
|--------------------------------------------------------------------------
*/

    'education_uis_logo' => [
        'path' => '/media/education-logo-university-of-illinois-springfield-500x250.webp',

        'width' => 500,

        'height' => 250,

        'alt' => 'University of Illinois Springfield',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Education — Background Image — Purdue University Global
|--------------------------------------------------------------------------
*/

    'education_purdue_background' => [
        'path' => '/media/education-background-purdue-university-global-1200x444.webp',

        'width' => 1200,

        'height' => 444,

        'alt' => '',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Education Logo — Purdue University Global
|--------------------------------------------------------------------------
*/

    'education_purdue_logo' => [
        'path' => '/media/education-logo-purdue-university-global-500x137.webp',

        'width' => 500,

        'height' => 137,

        'alt' => 'Purdue University Global',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Personal Interest — Coffee Roasting
|--------------------------------------------------------------------------
*/

    'interest_coffee' => [
        'path' => '/media/interests-and-hobbies-roasted-beans-and-espresso800x602.webp',

        'width' => 800,

        'height' => 602,

        'alt' => 'Freshly roasted coffee beans and espresso',

        'description' =>
            'A white ceramic cup filled with coffee rests on a matching saucer on a wooden table. Dark roasted coffee beans are scattered across the saucer and tabletop around the cup, representing Tim’s interest in home coffee roasting.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Personal Interest — Baking and Chocolatiering
|--------------------------------------------------------------------------
*/

    'interest_chocolate' => [
        'path' => '/media/interests-and-hobbies-chocolate-babka-800x602.webp',

        'width' => 800,

        'height' => 602,

        'alt' => 'Homemade chocolate babka',

        'description' =>
            'A freshly baked chocolate babka with dark chocolate swirled through its braided top sits on a white plate held by Tim. Several small candles are lit across the top of the loaf, representing Tim’s interest in baking and chocolatiering.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Personal Interest — Pizza Making
|--------------------------------------------------------------------------
*/

    'interest_pizza' => [
        'path' => '/media/interests-and-hobbies-neapolitan-pizza-800x602.webp',

        'width' => 800,

        'height' => 602,

        'alt' => 'Homemade Neapolitan-style pizza',

        'description' =>
            'A homemade Neapolitan-style pizza rests on a round wooden board beside a pizza oven. Its puffy, blistered and lightly charred crust surrounds tomato sauce, melted cheese, and several fresh basil leaves, representing Tim’s interest in pizza making.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Personal Interest — AI and Emerging Technology
|--------------------------------------------------------------------------
*/

    'interest_technology' => [
        'path' => '/media/profile-pic-tim-gabaree-geeking-out-800x533.webp',

        'width' => 800,

        'height' => 533,

        'alt' => 'Tim exploring technology',

        'description' =>
            'Illustrated portrait of Tim smiling and wearing dark-framed glasses and a dark shirt. Behind him, a stylized technology-themed background contains circuit traces, data-chart symbols, and the outline of a human head containing a gear, representing Tim’s interest in artificial intelligence and emerging technology.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| About Family Image
|--------------------------------------------------------------------------
*/

    'about_family' => [
        'path' => '/media/about-gabaree-family-800x600.webp',

        'width' => 800,

        'height' => 600,

        'alt' => 'Tim, Carrie, Clint, and Finn in Halloween costumes',

        'description' =>
            'Family selfie at a Halloween gathering. Carrie smiles from the upper left in a dark superhero-style costume, Clint wears a gray Batman costume and black mask, and Finn wears a white chef’s hat and chef costume. Tim smiles at the camera from the right, with other costumed people visible behind the family.',

        'loading' => 'eager',

        'fetchpriority' => 'high',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Architecture Background
|--------------------------------------------------------------------------
*/

    'background' => [
        'path' => '/media/background-pic-architecture-1920x942.webp',

        'width' => 1920,

        'height' => 942,

        'alt' => '',

        'loading' => 'eager',

        'fetchpriority' => 'high',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| About Gallery — Statue of Liberty
|--------------------------------------------------------------------------
*/

    'about_liberty_family' => [
        'path' => '/media/about-lady-liberty-finn-clint-carrie-tim-800x1067.webp',

        'width' => 800,

        'height' => 1067,

        'alt' => 'Tim, Carrie, Clint, and Finn at the Statue of Liberty',

        'description' =>
            'Close family selfie outdoors at the Statue of Liberty. Tim, wearing sunglasses, Carrie, and Finn fill the foreground while Clint leans into the photograph from above. The Statue of Liberty rises in the background against a vivid blue sky with scattered white clouds.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| About Gallery — Ellis Island
|--------------------------------------------------------------------------
*/

    'about_ellis_island' => [
        'path' => '/media/about-finn-clint-working-hard-message-800x486.webp',

        'width' => 800,

        'height' => 486,

        'alt' => 'Clint and Finn viewing an Ellis Island exhibit',

        'description' =>
            'Clint and Finn stand side by side facing a large museum exhibit at Ellis Island. Above them, a prominent quotation describes being given nothing, having to work hard, and immigrants coming to America expecting to work harder to get anything. Historical photographs, illustrations, and interpretive panels extend across the exhibit wall.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| About Gallery — Mount Vernon
|--------------------------------------------------------------------------
*/

    'about_mount_vernon' => [
        'path' => '/media/about-gabaree-family-mt-vernon-800x600.webp',

        'width' => 800,

        'height' => 600,

        'alt' => 'Tim, Carrie, Clint, and Finn at Mount Vernon',

        'description' =>
            'Family selfie outdoors at Mount Vernon. Carrie and Tim lean into the photograph from the left and right while Clint and Finn stand between them wearing caps and sunglasses. George Washington’s Mount Vernon mansion is centered behind the family beneath a bright blue sky with scattered clouds.',

        'roles' => [
            'sitemap',
        ],
    ],

/*
|--------------------------------------------------------------------------
| Contact Icon — Email
|--------------------------------------------------------------------------
*/

    'contact_email' => [
        'path' => '/media/contact-email-icon-50x50.webp',

        'width' => 50,

        'height' => 50,

        'alt' => '',
    ],

/*
|--------------------------------------------------------------------------
| Contact Icon — Telephone
|--------------------------------------------------------------------------
*/

    'contact_telephone' => [
        'path' => '/media/contact-telephone-icon-50x50.webp',

        'width' => 50,

        'height' => 50,

        'alt' => '',
    ],

/*
|--------------------------------------------------------------------------
| Contact Icon — LinkedIn
|--------------------------------------------------------------------------
*/

    'contact_linkedin' => [
        'path' => '/media/contact-linkedin-icon-50x50.webp',

        'width' => 50,

        'height' => 50,

        'alt' => '',
    ],

/*
|--------------------------------------------------------------------------
| Contact QR Code
|--------------------------------------------------------------------------
*/

    'qr_code' => [
        'path' => '/media/qr-code-tim-gabaree-500x500.webp',

        'width' => 500,

        'height' => 500,

        'alt' => 'QR code to Tim Gabaree’s contact page',

        'roles' => [
            'sitemap',
        ],
    ],
];

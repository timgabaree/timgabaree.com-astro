<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    exclude-result-prefixes="sitemap image">

  <xsl:output
      method="html"
      encoding="UTF-8"
      indent="yes"/>

  <xsl:template match="/">

    <html lang="en">

      <head>

        <meta charset="UTF-8"/>

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1"/>

        <meta
            name="robots"
            content="noindex, follow"/>

        <meta
            name="theme-color"
            content="#111111"/>

        <title>Sitemap | Tim Gabaree</title>

        <meta
            name="description"
            content="Human-friendly XML sitemap for timgabaree.com, including public pages and associated images."/>

<!-- Favicons -->

        <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicon-96.png"/>

        <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"/>

        <link
            rel="icon"
            href="/favicon.ico"/>

        <link
            rel="stylesheet"
            href="/css/style.css?v=20260930.02"/>

        <style>

<!--
|==========================================================================
| Sitemap-Specific Presentation
|==========================================================================
|
| Shared typography, navigation, buttons, colors, and footer styling
| come from /css/style.css. These rules are limited to the sitemap.
|
-->

          body {
            min-width: 320px;
          }

          .sitemap-page {
            position: relative;
            isolation: isolate;
            padding: 58px 20px 20px;
          }

          .sitemap-page > :not(.page-background-image) {
            position: relative;
            z-index: 1;
          }

          .sitemap-container {
            width: 100%;
            max-width: 980px;
            margin: 0 auto;
          }

          .sitemap-intro,
          .sitemap-stat-card,
          .page-card {
            background: var(--white);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-standard);
            box-shadow: 0 2px 5px var(--shadow-soft);
          }

          .sitemap-intro {
            margin: 0 auto 24px;
            padding: 30px;
          }

          .sitemap-eyebrow,
          .page-kicker {
            margin: 0 0 10px;
            color: var(--accent-color);
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .sitemap-eyebrow {
            font-size: 18px;
          }

          .sitemap-intro h1 {
            margin: 0 0 18px;
            color: var(--primary-color);
            font-size: clamp(38px, 6vw, 58px);
            line-height: 1;
            letter-spacing: -0.045em;
            text-transform: uppercase;
          }

          .sitemap-site-link,
          .sitemap-site-link:visited {
            display: inline-block;
            color: inherit;
            text-decoration: none;
            transition: transform 0.18s ease;
          }

          .sitemap-site-link:hover,
          .sitemap-site-link:focus {
            color: inherit;
            text-decoration: none;
            transform: translateY(-2px);
          }

          .sitemap-intro p:last-child {
            margin-bottom: 0;
            color: var(--text-muted);
            font-size: 16px;
            line-height: 1.65;
          }

          .stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin: 0 0 24px;
          }

          .sitemap-stat-card {
            min-width: 0;
            padding: 22px;
            text-align: center;
          }

          .stat-label {
            display: block;
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .stat-value {
            display: block;
            margin-top: 6px;
            color: var(--primary-color);
            font-size: clamp(24px, 4vw, 34px);
            font-weight: 700;
            line-height: 1.15;
          }

          .section-heading {
            margin: 28px 0 20px;
            text-align: center;
          }

          .section-heading .sitemap-eyebrow {
            margin-bottom: 6px;
          }

          .section-heading h2 {
            margin: 0;
            color: var(--accent-color);
            font-size: 28px;
          }

          .section-heading > p {
            max-width: 700px;
            margin: 10px auto 0;
            color: var(--text-muted);
          }

          .page-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px;
          }

          .page-card {
            min-width: 0;
            overflow: hidden;
          }

          .page-card-inner {
            padding: 26px;
          }

          .page-kicker {
            font-size: 12px;
            letter-spacing: 0.11em;
          }

          .page-title {
            margin: 0;
            color: var(--primary-color);
            font-size: 24px;
            line-height: 1.25;
          }

          .page-url,
          .page-url:visited,
          .image-link,
          .image-link:visited {
            color: var(--brand-blue);
            text-decoration: none;
          }

          .page-url {
            display: inline-block;
            max-width: 100%;
            margin-top: 9px;
            overflow-wrap: anywhere;
          }

          .page-url:hover,
          .page-url:focus,
          .image-link:hover,
          .image-link:focus {
            color: var(--brand-blue-hover);
            text-decoration: underline;
          }

          .metadata {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 22px;
          }

          .metadata-item {
            min-width: 0;
            padding: 13px;
            background: var(--white);
            border: 1px solid var(--border-color);
            border-radius: 10px;
          }

          .metadata-label {
            display: block;
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .metadata-value {
            display: block;
            margin-top: 4px;
            color: var(--text-dark);
            font-size: 14px;
            font-weight: 700;
            overflow-wrap: anywhere;
          }

          details {
            border-top: 1px solid var(--border-color);
          }

          summary {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 18px 26px;
            color: var(--text-dark);
            cursor: pointer;
            font-weight: 700;
            list-style: none;
          }

          summary::-webkit-details-marker {
            display: none;
          }

          summary::after {
            display: inline-grid;
            flex: 0 0 30px;
            place-items: center;
            width: 30px;
            height: 30px;
            color: var(--accent-color);
            background-color: var(--surface-muted);
            border-radius: 50%;
            content: "+";
            font-size: 20px;
          }

          details[open] summary::after {
            content: "−";
          }

          .image-list {
            display: grid;
            gap: 14px;
            padding: 0 26px 26px;
          }

          .image-card {
            display: grid;
            grid-template-columns: 118px minmax(0, 1fr);
            gap: 16px;
            align-items: center;
            padding: 12px;
            background: var(--white);
            border: 1px solid var(--border-color);
            border-radius: 12px;
          }

          .image-card img {
            display: block;
            width: 118px;
            height: 86px;
            border-radius: 8px;
            object-fit: cover;
          }

          .image-title {
            margin: 0;
            color: var(--text-dark);
            font-size: 16px;
            line-height: 1.35;
          }

          .image-link {
            display: inline-block;
            margin-top: 8px;
            font-size: 13px;
          }

          .empty-images {
            margin: 0;
            padding: 0 26px 26px;
            color: var(--text-muted);
          }

          .return-navigation {
            margin: 24px 0 0;
            text-align: center;
          }

          .return-navigation .primary-cta-button {
            margin-top: 0;
            color: #FFFFFF;
            background-color: #394C78;
            background-image: none;
            border-color: #394C78;
            opacity: 1;
          }

          .return-navigation .primary-cta-button:hover,
          .return-navigation .primary-cta-button:focus {
            color: #FFFFFF;
            background-color: #4B6294;
            background-image: none;
            border-color: #4B6294;
            opacity: 1;
          }

          .sitemap-footer {
            position: relative;
            z-index: 2;
            margin: 0 0 15px;
            color: var(--text-muted);
            font-size: 14px;
            text-align: center;
          }

          .sitemap-footer p {
            margin: 0;
          }

          .sitemap-footer p + p {
            margin-top: 6px;
          }

          .sitemap-footer a,
          .sitemap-footer a:visited {
            color: inherit;
            text-decoration: none;
          }

          .sitemap-footer a:hover,
          .sitemap-footer a:focus {
            color: var(--accent-hover);
            text-decoration: underline;
          }

          @media (max-width: 800px) {
            .page-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
            .sitemap-page {
              padding: 12px 14px 20px;
            }

            .sitemap-intro {
              padding: 22px;
            }

            .stats {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .sitemap-stat-card {
              padding: 18px;
            }

            .page-card-inner,
            summary {
              padding-right: 20px;
              padding-left: 20px;
            }

            .image-list {
              padding-right: 20px;
              padding-left: 20px;
            }
          }

          @media (max-width: 480px) {
            .metadata {
              grid-template-columns: 1fr;
            }

            .image-card {
              grid-template-columns: 1fr;
            }

            .image-card img {
              width: 100%;
              height: auto;
              max-height: 220px;
            }
          }
        </style>

      </head>

      <body>

<!-- Navbar -->

        <nav
          class="navbar"
          aria-label="Primary navigation">

          <button
            class="navbar-toggler"
            type="button"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Open navigation menu">

            <span
              class="navbar-toggler-icon"
              aria-hidden="true">
            </span>

          </button>

          <a
            class="navbar-brand"
            href="/#home">
            Tim Gabaree
          </a>

          <div
            class="navbar-collapse"
            id="navbarNav">

            <ul class="navbar-nav">

              <li class="nav-item">
                <a
                  class="nav-link"
                  href="/#home">
                  Home
                </a>
              </li>

              <li class="nav-item dropdown">

                <button
                  class="nav-link dropdown-toggle"
                  type="button"
                  aria-expanded="false"
                  aria-controls="operating-leadership-menu"
                  aria-haspopup="true">
                  Operating Leadership
                </button>

                <div
                  class="dropdown-menu"
                  id="operating-leadership-menu">

                  <a
                    class="dropdown-item"
                    href="/#operating-results">
                    Operating Results
                  </a>

                  <a
                    class="dropdown-item"
                    href="/#board">
                    Board and Advisory
                  </a>

                  <a
                    class="dropdown-item"
                    href="/#results">
                    Strategic Impact
                  </a>

                  <a
                    class="dropdown-item"
                    href="/#expertise">
                    Expertise
                  </a>

                  <a
                    class="dropdown-item"
                    href="/#education">
                    Education
                  </a>

                </div>

              </li>

              <li class="nav-item dropdown">

                <button
                  class="nav-link dropdown-toggle"
                  type="button"
                  aria-expanded="false"
                  aria-controls="about-menu"
                  aria-haspopup="true">
                  About
                </button>

                <div
                  class="dropdown-menu"
                  id="about-menu">

                  <a
                    class="dropdown-item"
                    href="/about">
                    About Tim
                  </a>

                  <a
                    class="dropdown-item"
                    href="/#q-and-a">
                    Leadership Perspective
                  </a>

                  <a
                    class="dropdown-item"
                    href="/#testimonials">
                    Testimonials
                  </a>

                </div>

              </li>

              <li class="nav-item">
                <a
                  class="nav-link"
                  href="/contact">
                  Connect
                </a>
              </li>

            </ul>

          </div>

          <div
            class="nav-link-container"
            aria-label="Tim Gabaree social profiles">

            <a
              class="nav-link"
              href="https://timgabaree.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Tim Gabaree’s blog — opens in a new tab">

              <img
                src="/media/social-media-blogger-icon-50x50.webp"
                width="25"
                height="25"
                alt=""
                aria-hidden="true"/>

            </a>

            <a
              class="nav-link"
              href="https://www.linkedin.com/in/timgabaree"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Visit Tim Gabaree’s LinkedIn profile — opens in a new tab">

              <img
                src="/media/social-media-linkedin-icon-50x50.webp"
                width="25"
                height="25"
                alt=""
                aria-hidden="true"/>

            </a>

            <a
              class="nav-link"
              href="https://github.com/timgabaree"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Tim Gabaree’s GitHub profile — opens in a new tab">

              <img
                src="/media/social-media-github-icon-50x50.webp"
                width="25"
                height="25"
                alt=""
                aria-hidden="true"/>

            </a>

          </div>

        </nav>

<!-- End Navbar -->

        <main class="sitemap-page">

          <img
            class="page-background-image"
            src="/media/background-pic-architecture-1920x942.webp"
            width="1920"
            height="942"
            alt=""
            loading="eager"
            fetchpriority="high"/>

          <div class="sitemap-container">

<!-- Sitemap Introduction -->

            <section class="sitemap-intro">

              <p class="sitemap-eyebrow">
                XML Sitemap
              </p>

              <h1>
                <a
                  class="sitemap-site-link"
                  href="/">
                  TimGabaree.com
                </a>
                Sitemap
              </h1>

              <p>
                A human-friendly index of the public pages and images
                available on timgabaree.com. This XML sitemap also helps
                search engines discover and understand the site’s content.
              </p>

            </section>

<!-- End Sitemap Introduction -->

<!-- Statistics -->

            <div
              class="stats"
              aria-label="Sitemap statistics">

              <div class="sitemap-stat-card">

                <span class="stat-label">
                  Total Pages
                </span>

                <span class="stat-value">
                  <xsl:value-of
                    select="count(sitemap:urlset/sitemap:url)"/>
                </span>

              </div>

              <div class="sitemap-stat-card">

                <span class="stat-label">
                  Total Images
                </span>

                <span class="stat-value">
                  <xsl:value-of
                    select="count(sitemap:urlset/sitemap:url/image:image)"/>
                </span>

              </div>

              <div class="sitemap-stat-card">

                <span class="stat-label">
                  Latest Update
                </span>

                <span class="stat-value">

                  <xsl:for-each
                    select="sitemap:urlset/sitemap:url/sitemap:lastmod">

                    <xsl:sort
                      select="."
                      data-type="text"
                      order="descending"/>

                    <xsl:if test="position() = 1">

                      <xsl:call-template name="format-date">

                        <xsl:with-param
                          name="date"
                          select="."/>

                      </xsl:call-template>

                    </xsl:if>

                  </xsl:for-each>

                </span>

              </div>

            </div>

<!-- End Statistics -->

<!-- Main Content -->

          <div class="section-heading">

            <div>

              <h2>
                Indexed Pages
              </h2>

            </div>

            <p>
              Each card includes the canonical page URL, last significant
              update, and the images associated with that page.
            </p>

          </div>

          <div class="page-grid">

            <xsl:for-each select="sitemap:urlset/sitemap:url">

              <article class="page-card">

                <div class="page-card-inner">

                  <p class="page-kicker">
                    Site Page
                  </p>

                  <h3 class="page-title">

                    <xsl:call-template name="page-title">

                      <xsl:with-param
                          name="url"
                          select="sitemap:loc"/>

                    </xsl:call-template>

                  </h3>

                  <a
                      class="page-url"
                      href="{sitemap:loc}">

                    <xsl:value-of select="sitemap:loc"/>

                  </a>

                  <div class="metadata">

                    <div class="metadata-item">

                      <span class="metadata-label">
                        Updated
                      </span>

                      <span class="metadata-value">

                        <xsl:call-template name="format-date">

                          <xsl:with-param
                              name="date"
                              select="sitemap:lastmod"/>

                        </xsl:call-template>

                      </span>

                    </div>

                    <div class="metadata-item">

                      <span class="metadata-label">
                        Images
                      </span>

                      <span class="metadata-value">

                        <xsl:value-of select="count(image:image)"/>

                      </span>

                    </div>

                  </div>

                </div>

                <xsl:choose>

                  <xsl:when test="image:image">

                    <details>

                      <summary>

                        <span>View <xsl:value-of select="count(image:image)"/> indexed image<xsl:if test="count(image:image) != 1">s</xsl:if></span>

                      </summary>

                      <div class="image-list">

                        <xsl:for-each select="image:image">

                          <article class="image-card">

                            <a
                                href="{image:loc}"
                                aria-label="Open full-size image">

                              <img
                                  src="{image:loc}"
                                  alt=""
                                  loading="lazy"
                                  decoding="async"/>

                            </a>

                            <div>

                              <h4 class="image-title">

                                <xsl:call-template name="image-title">

                                  <xsl:with-param
                                      name="url"
                                      select="image:loc"/>

                                </xsl:call-template>

                              </h4>

                              <a
                                  class="image-link"
                                  href="{image:loc}">
                                View image
                              </a>

                            </div>

                          </article>

                        </xsl:for-each>

                      </div>

                    </details>

                  </xsl:when>

                  <xsl:otherwise>

                    <p class="empty-images">
                      No images are listed for this page.
                    </p>

                  </xsl:otherwise>

                </xsl:choose>

              </article>

            </xsl:for-each>

          </div>

<!-- Return Navigation -->

            <nav
              class="return-navigation"
              aria-label="Return navigation">

              <a
                class="primary-cta-button"
                href="/">
                Return to Main Page
              </a>

            </nav>

<!-- End Return Navigation -->

          </div>

        </main>

<!-- End Main Content -->

<!-- Footer -->

        <footer class="sitemap-footer">

          <p>

            <a href="/">
              Home
            </a>

            <xsl:text> | </xsl:text>

            <a href="/privacy">
              Privacy Policy
            </a>

          </p>

          <p>
            © 2023–2026 Tim Gabaree. All Rights Reserved.
          </p>

        </footer>

<!-- End Footer -->

        <script
          src="/js/main.js?v=20260819.01"
          defer="defer">
        </script>

      </body>

    </html>

  </xsl:template>

<!--
|==========================================================================
| Page Title
|==========================================================================
-->

  <xsl:template name="page-title">

    <xsl:param name="url"/>

    <xsl:choose>

      <xsl:when test="$url = 'https://timgabaree.com/'">
        Home Page/Executive Profile
      </xsl:when>

      <xsl:when test="$url = 'https://timgabaree.com/about'">
        About
      </xsl:when>

      <xsl:when test="$url = 'https://timgabaree.com/contact'">
        Contact and Resources
      </xsl:when>

      <xsl:when test="$url = 'https://timgabaree.com/privacy'">
        Privacy Policy
      </xsl:when>

      <xsl:otherwise>

        <xsl:call-template name="filename-title">

          <xsl:with-param
              name="url"
              select="$url"/>

        </xsl:call-template>

      </xsl:otherwise>

    </xsl:choose>

  </xsl:template>

<!--
|==========================================================================
| Page Filename to Title
|==========================================================================
-->

  <xsl:template name="filename-title">

    <xsl:param name="url"/>

    <xsl:variable
        name="after-domain"
        select="substring-after($url, 'timgabaree.com/')"/>

    <xsl:choose>

      <xsl:when test="string-length($after-domain) = 0">
        Tim Gabaree
      </xsl:when>

      <xsl:otherwise>

        <xsl:call-template name="replace-separators">

          <xsl:with-param
              name="text"
              select="$after-domain"/>

        </xsl:call-template>

      </xsl:otherwise>

    </xsl:choose>

  </xsl:template>

<!--
|==========================================================================
| Image URL to Readable Title
|==========================================================================
-->

  <xsl:template name="image-title">

    <xsl:param name="url"/>

    <xsl:value-of
      select="substring-after($url, '/media/')"/>

  </xsl:template>

<!--
|==========================================================================
| Replace Hyphens and Underscores
|==========================================================================
-->

  <xsl:template name="replace-separators">

    <xsl:param name="text"/>

    <xsl:choose>

      <xsl:when test="contains($text, '-')">

        <xsl:value-of select="substring-before($text, '-')"/>

        <xsl:text> </xsl:text>

        <xsl:call-template name="replace-separators">

          <xsl:with-param
              name="text"
              select="substring-after($text, '-')"/>

        </xsl:call-template>

      </xsl:when>

      <xsl:when test="contains($text, '_')">

        <xsl:value-of select="substring-before($text, '_')"/>

        <xsl:text> </xsl:text>

        <xsl:call-template name="replace-separators">

          <xsl:with-param
              name="text"
              select="substring-after($text, '_')"/>

        </xsl:call-template>

      </xsl:when>

      <xsl:otherwise>
        <xsl:value-of select="$text"/>
      </xsl:otherwise>

    </xsl:choose>

  </xsl:template>

<!--
|==========================================================================
| Date Formatting
|==========================================================================
-->

  <xsl:template name="format-date">

    <xsl:param name="date"/>

    <xsl:choose>

      <xsl:when test="string-length($date) &gt;= 10">

        <xsl:variable
            name="year"
            select="substring($date, 1, 4)"/>

        <xsl:variable
            name="month"
            select="substring($date, 6, 2)"/>

        <xsl:variable
            name="day"
            select="number(substring($date, 9, 2))"/>

        <xsl:choose>

          <xsl:when test="$month = '01'">January</xsl:when>
          <xsl:when test="$month = '02'">February</xsl:when>
          <xsl:when test="$month = '03'">March</xsl:when>
          <xsl:when test="$month = '04'">April</xsl:when>
          <xsl:when test="$month = '05'">May</xsl:when>
          <xsl:when test="$month = '06'">June</xsl:when>
          <xsl:when test="$month = '07'">July</xsl:when>
          <xsl:when test="$month = '08'">August</xsl:when>
          <xsl:when test="$month = '09'">September</xsl:when>
          <xsl:when test="$month = '10'">October</xsl:when>
          <xsl:when test="$month = '11'">November</xsl:when>
          <xsl:when test="$month = '12'">December</xsl:when>

        </xsl:choose>

        <xsl:text> </xsl:text>

        <xsl:value-of select="$day"/>

        <xsl:text>, </xsl:text>

        <xsl:value-of select="$year"/>

      </xsl:when>

      <xsl:otherwise>
        <xsl:value-of select="$date"/>
      </xsl:otherwise>

    </xsl:choose>

  </xsl:template>

</xsl:stylesheet>

const triggers =
  document.querySelectorAll(
    "[data-calendly-trigger]"
  );

function openCalendly(
  calendlyUrl
) {
  if (
    typeof window.Calendly === "undefined" ||
    typeof window.Calendly.initPopupWidget !== "function"
  ) {
    return false;
  }

  window.Calendly.initPopupWidget({
    url: calendlyUrl
  });

  return true;
}

function loadCalendlyStylesheet() {
  const existingStylesheet =
    document.querySelector(
      'link[data-calendly-stylesheet]'
    );

  if (existingStylesheet) {
    return;
  }

  const stylesheet =
    document.createElement(
      "link"
    );

  stylesheet.rel =
    "stylesheet";

  stylesheet.href =
    "https://assets.calendly.com/assets/external/widget.css";

  stylesheet.dataset.calendlyStylesheet =
    "true";

  document.head.appendChild(
    stylesheet
  );
}

function loadCalendlyScript(
  calendlyUrl
) {
  const existingScript =
    document.querySelector(
      'script[data-calendly-script]'
    );

  if (existingScript) {
    existingScript.addEventListener(
      "load",
      function () {
        openCalendly(
          calendlyUrl
        );
      },
      {
        once: true
      }
    );

    return;
  }

  const script =
    document.createElement(
      "script"
    );

  script.src =
    "https://assets.calendly.com/assets/external/widget.js";

  script.async =
    true;

  script.dataset.calendlyScript =
    "true";

  script.addEventListener(
    "load",
    function () {
      openCalendly(
        calendlyUrl
      );
    },
    {
      once: true
    }
  );

  script.addEventListener(
    "error",
    function () {
      window.location.assign(
        calendlyUrl
      );
    },
    {
      once: true
    }
  );

  document.body.appendChild(
    script
  );
}

triggers.forEach(
  function (trigger) {
    trigger.addEventListener(
      "click",
      function (event) {
        const calendlyUrl =
          trigger.dataset.calendlyUrl ||
          trigger.getAttribute(
            "href"
          ) ||
          "";

        if (calendlyUrl === "") {
          return;
        }

        event.preventDefault();

        window.dataLayer =
          window.dataLayer || [];

        window.dataLayer.push({
          event:
            "calendly_click"
        });

        if (
          openCalendly(
            calendlyUrl
          )
        ) {
          return;
        }

        loadCalendlyStylesheet();

        loadCalendlyScript(
          calendlyUrl
        );
      }
    );
  }
);

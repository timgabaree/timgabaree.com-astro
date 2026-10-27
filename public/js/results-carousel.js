const carousel =
  document.querySelector(
    "#results-carousel"
  );

const toggleButton =
  document.querySelector(
    "#results-animation-toggle"
  );

if (
  carousel &&
  toggleButton
) {
  toggleButton.addEventListener(
    "click",
    function () {
      const isPaused =
        carousel.classList.toggle(
          "is-paused"
        );

      toggleButton.setAttribute(
        "aria-pressed",
        String(isPaused)
      );

      toggleButton.textContent =
        isPaused
          ? "Resume animation"
          : "Pause animation";
    }
  );
}

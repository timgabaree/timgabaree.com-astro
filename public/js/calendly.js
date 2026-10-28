(function () {
  const dialog = document.getElementById('scheduling-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return; // Ordinary link fallback.
  const container = dialog.querySelector('[data-scheduling-frame]');
  const directLink = dialog.querySelector('[data-scheduling-direct]');
  const closeButtons = dialog.querySelectorAll('[data-scheduling-close]');
  let opener;

  closeButtons.forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    const first = closeButtons[0];
    const last = closeButtons[closeButtons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('close', function () {
    container.replaceChildren();
    document.documentElement.classList.remove('scheduling-open');
    opener?.focus();
  });

  document.querySelectorAll('[data-calendly-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(trigger.dataset.calendlyUrl || trigger.href);
      if (url.origin !== 'https://calendly.com') return;
      event.preventDefault();
      opener = trigger;
      directLink.href = url.href;
      // Basic iframe supported by Calendly; no vendor popup controls or scripts.
      const frame = document.createElement('iframe');
      frame.title = 'Schedule a meeting with Tim Gabaree';
      frame.src = url.href;
      container.replaceChildren(frame);
      dialog.showModal();
      document.documentElement.classList.add('scheduling-open');
      closeButtons[0].focus();
      window.siteAnalytics?.track({ event: 'calendly_click' });
    });
  });
})();

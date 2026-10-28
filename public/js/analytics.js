(function () {
  const key = 'tg-analytics-choice-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const panel = document.querySelector('[data-analytics-panel]');
  if (!panel) return;
  const status = document.querySelector('[data-analytics-status]');
  const opener = document.querySelector('[data-analytics-open]');
  const reject = document.querySelector('[data-analytics-reject]');
  let loaded = false;
  let returnFocus = false;

  function readChoice() {
    try {
      // Fail closed if preferences cannot be saved, including in restricted browsers.
      localStorage.setItem(`${key}-check`, '1');
      localStorage.removeItem(`${key}-check`);
      const value = JSON.parse(localStorage.getItem(key));
      return value && ['accepted', 'declined'].includes(value.choice) &&
        Number.isFinite(value.expires) && value.expires > Date.now() &&
        value.expires <= Date.now() + lifetime ? value.choice : null;
    } catch { return null; }
  }

  let choice = readChoice();
  function clearAnalyticsCookies() {
    // Leave form/security cookies alone.
    for (const part of document.cookie.split(';')) {
      const name = part.trim().split('=')[0];
      if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_gac_|_gcl_)/.test(name)) continue;
      for (const domain of ['', window.location.hostname, '.timgabaree.com']) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
      }
    }
  }

  function loadAnalytics() {
    if (loaded || choice !== 'accepted' || panel.dataset.analyticsEnabled !== 'true' ||
        window.location.hostname !== 'timgabaree.com') return;
    loaded = true;
    window['ga-disable-G-WV3F87ZRF2'] = false;
    window.dataLayer = [];
    function consent() { window.dataLayer.push(arguments); }
    consent('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    consent('consent', 'update', { analytics_storage: 'granted' });
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-ML7T9TJ8';
    document.head.appendChild(script);
  }

  // Never queue activity that occurred before consent, or on preview/staging hosts.
  window.siteAnalytics = {
    track(event) {
      if (choice === 'accepted' && loaded) window.dataLayer.push(event);
    },
  };

  function choose(next) {
    try {
      localStorage.setItem(key, JSON.stringify({ choice: next, expires: Date.now() + lifetime }));
    } catch {
      if (next === 'accepted') {
        status.textContent = 'Your browser cannot save this choice. Analytics remain off; you can continue using the site.';
        return;
      }
      // readChoice also fails closed when storage is unavailable after a reload.
      try { localStorage.removeItem(key); } catch { /* Storage is restricted. */ }
    }
    choice = next;
    if (next === 'declined') {
      window['ga-disable-G-WV3F87ZRF2'] = true;
      clearAnalyticsCookies();
      // Unload already-running tags and listeners, not just the script element.
      if (loaded) { window.location.reload(); return; }
    }
    panel.hidden = true;
    if (returnFocus) opener.focus();
    else {
      const main = document.getElementById('main-content');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus(); }
    }
    loadAnalytics();
  }

  document.querySelector('[data-analytics-settings]').hidden = false;
  opener.addEventListener('click', function () {
    returnFocus = true;
    panel.hidden = false;
    status.textContent = choice === 'accepted' ? 'Analytics are currently accepted.' : 'Analytics are currently off.';
    reject.focus();
  });
  reject.addEventListener('click', () => choose('declined'));
  document.querySelector('[data-analytics-accept]').addEventListener('click', () => choose('accepted'));
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    choice = readChoice();
    if (choice !== 'accepted' && loaded) {
      window['ga-disable-G-WV3F87ZRF2'] = true;
      clearAnalyticsCookies();
      window.location.reload();
    } else {
      panel.hidden = choice !== null;
      loadAnalytics();
    }
  });
  panel.hidden = choice !== null;
  if (choice !== 'accepted') clearAnalyticsCookies();
  loadAnalytics();
})();

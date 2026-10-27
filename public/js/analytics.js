(function () {
  if (window.location.hostname !== 'timgabaree.com') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-ML7T9TJ8';
  document.head.appendChild(script);
})();

(() => {
  // Only count the production site. Local previews and cached old-domain pages
  // must neither add visits nor combine a domain's counters with itself.
  const canonical = document.querySelector('link[rel=canonical]');
  if (!canonical || new URL(canonical.href).origin !== location.origin) return;
  const counters = ['site_uv', 'site_pv', 'page_pv'].map(key => ({
    key, element: document.getElementById('busuanzi_value_' + key),
  })).filter(counter => counter.element);
  if (!counters.length) return;
  const callback = 'BlogVisits_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const script = document.createElement('script');
  let settled = false;
  const finish = data => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    for (const { key, element } of counters) {
      const baseline = Number(element.dataset.historyValue || 0);
      const live = data?.[key];
      const valid = Number.isSafeInteger(live) && live >= 0;
      element.textContent = valid ? String(baseline + live) : baseline ? String(baseline) + '+' : '…';
      if (!valid) element.title = 'Historical count only; live statistics are temporarily unavailable.';
    }
    script.remove();
    delete window[callback];
  };
  window[callback] = finish;
  const timer = setTimeout(() => finish(null), 10000);
  script.onerror = () => finish(null);
  // The provider keys article counts by the full Referer URL. The browser's
  // default cross-origin policy would only send the origin and merge all pages.
  script.referrerPolicy = 'no-referrer-when-downgrade';
  script.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + callback;
  document.head.append(script);
})();

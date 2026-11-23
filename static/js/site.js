(() => {
  window.addEventListener('load', () => {
    if (window.cookieconsent) window.cookieconsent.initialise({
      type: 'info', theme: 'edgeless', static: false, position: 'bottom-left',
      content: { message: 'This website uses cookies to improve your experience.', dismiss: 'Got it!', allow: 'Allow cookies', deny: 'Decline', link: 'Learn more', policy: 'Cookie Policy', href: 'https://www.cookiesandyou.com/' },
      palette: { popup: { background: '#edeff5', text: '#838391' }, button: { background: '#4b81e8' } },
    });
  });
  // A real ShareThis installation needs a publisher id. The old configuration
  // points to the homepage, so use working share links until one is configured.
  const share = document.querySelector('.sharethis-inline-share-buttons');
  if (share) {
    const url = document.querySelector('link[rel=canonical]').href;
    const destinations = [
      ['X', 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(document.title)],
      ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)],
      ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)],
    ];
    share.classList.add('share-links');
    for (const [label, href] of destinations) {
      const a = document.createElement('a'); a.textContent = label; a.href = href;
      a.className = 'button is-small'; a.target = '_blank'; a.rel = 'noopener'; share.append(a);
    }
    if (navigator.share) {
      const button = document.createElement('button'); button.textContent = 'Share'; button.className = 'button is-small';
      button.addEventListener('click', () => navigator.share({ title: document.title, url }).catch(() => {})); share.append(button);
    }
  }
  const ads = [...document.querySelectorAll('.adsbygoogle')].filter(ad => ad.dataset.adClient?.trim() && ad.dataset.adSlot?.trim());
  if (ads.length && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ads[0].dataset.adClient);
    script.crossOrigin = 'anonymous'; script.onload = () => {
      ads.forEach(() => (window.adsbygoogle = window.adsbygoogle || []).push({}));
    };
    document.head.append(script);
  }
  document.querySelectorAll('.donate[role=button]').forEach(button => button.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); }
  }));
  const switchTab = () => {
    if (!location.hash) return;
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const menu = [...document.querySelectorAll('.tabs a')].find(a => a.getAttribute('href') === '#' + id);
    if (!menu) return;
    for (const a of menu.closest('ul').querySelectorAll('a')) {
      a.parentElement.classList.toggle('is-active', a === menu);
      document.getElementById(a.getAttribute('href').slice(1))?.classList.toggle('is-hidden', a !== menu);
    }
  };
  switchTab(); window.addEventListener('hashchange', switchTab);
})();

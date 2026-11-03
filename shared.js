document.addEventListener('DOMContentLoaded', function() {

  // The site's pages and the exact address each one is served at.
  // Cloudflare treats capital letters as different addresses, so this map
  // lets the canonical tag and the nav highlight work no matter how the
  // visitor typed the URL (/about, /About, /About.html, /about/).
  const PAGES = {
    '':         '/',
    'index':    '/',
    'about':    '/About',
    'gallery':  '/Gallery',
    'projects': '/Projects',
    'recipes':  '/Recipes',
    'contact':  '/Contact',
    'writing':  '/writing',
    'search':   '/search'
  };

  // "/About.html" -> "about", "/about/" -> "about", "/" -> ""
  function pageKey(path) {
    return path.replace(/\/+$/, '').split('/').pop().replace(/\.html$/i, '').toLowerCase();
  }

  const is404 = document.body.dataset.page === '404';
  const currentKey = pageKey(window.location.pathname);

  // Inject canonical tag for SEO (skipped on the 404 page)
  if (!is404) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    const cleanPath = PAGES[currentKey] !== undefined
      ? PAGES[currentKey]
      : (window.location.pathname.replace(/\/$/, '') || '/');
    canonical.href = 'https://dbgdocent.com' + cleanPath;
    document.head.appendChild(canonical);
  }

  // Load header
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;

      // Highlight the current page in the nav (nothing on the 404 page)
      if (!is404) {
        document.querySelectorAll('.site-nav a').forEach(link => {
          const href = link.getAttribute('href') || '';
          if (/^https?:/i.test(href) || href.includes('#')) return;
          if (pageKey(href) === (currentKey === '' ? 'index' : currentKey)) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          }
        });
      }

      // Mobile nav toggle
      const toggle = document.querySelector('.nav-toggle');
      const nav = document.querySelector('.site-nav');

      if (toggle && nav) {
        toggle.addEventListener('click', function() {
          nav.classList.toggle('nav-open');
          toggle.classList.toggle('active');
          toggle.setAttribute('aria-expanded', nav.classList.contains('nav-open') ? 'true' : 'false');
        });

        // On mobile, tapping "Projects" toggles its submenu instead of navigating
        const dropdownParent = document.querySelector('.nav-dropdown > a');
        if (dropdownParent) {
          dropdownParent.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
              e.preventDefault();
              const parent = this.closest('.nav-dropdown');
              parent.classList.toggle('dropdown-open');
            }
          });
        }

        // Close menu when clicking any nav link (except the Projects toggle on mobile)
        document.querySelectorAll('.site-nav a').forEach(link => {
          link.addEventListener('click', function() {
            const isDropdownToggle = this.closest('.nav-dropdown') &&
                                     this.parentElement.classList.contains('nav-dropdown') &&
                                     window.innerWidth <= 768;
            if (!isDropdownToggle) {
              nav.classList.remove('nav-open');
              toggle.classList.remove('active');
              toggle.setAttribute('aria-expanded', 'false');
              document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('dropdown-open'));
            }
          });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
          if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('nav-open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('dropdown-open'));
          }
        });
      }
    });

  // Load footer, then fill in the copyright year.
  // (A <script> inside footer.html never runs when inserted this way,
  // which is why the year used to be blank.)
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
      const year = document.getElementById('footer-year');
      if (year) year.textContent = new Date().getFullYear();
      loadFooterWeather();
    });

  // Small weather line in the footer: current conditions in Ahwatukee from
  // Open-Meteo (free, no key). Stays hidden if the service does not answer.
  function loadFooterWeather() {
    const box = document.getElementById('footer-weather');
    if (!box) return;
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=33.3384&longitude=-111.9837' +
      '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FPhoenix';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        const code = data.current.weather_code;
        const map = [
          [[0], 'fa-sun', 'clear'], [[1], 'fa-sun', 'mostly clear'],
          [[2], 'fa-cloud-sun', 'partly cloudy'], [[3], 'fa-cloud', 'overcast'],
          [[45, 48], 'fa-smog', 'foggy'], [[51, 53, 55], 'fa-cloud-rain', 'drizzle'],
          [[61, 63, 65, 80, 81, 82], 'fa-cloud-showers-heavy', 'rain'],
          [[71, 73, 75], 'fa-snowflake', 'snow'], [[95, 96, 99], 'fa-cloud-bolt', 'thunderstorms']
        ];
        const hit = map.find(m => m[0].includes(code)) || [null, 'fa-cloud', ''];
        const temp = Math.round(data.current.temperature_2m);
        let asOf = '';
        if (data.current.time) {
          const [h, m] = data.current.time.split('T')[1].split(':').map(Number);
          asOf = ` at ${(h % 12) || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`;
        }
        box.innerHTML = `<i class="fas ${hit[1]}" aria-hidden="true"></i>` +
          `<span>Ahwatukee: <strong>${temp}°F</strong>${hit[2] ? ', ' + hit[2] : ''}${asOf} · ` +
          `<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></span>`;
        box.hidden = false;
      })
      .catch(() => { /* leave it hidden */ })
      .finally(() => clearTimeout(timer));
  }
});

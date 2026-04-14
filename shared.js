document.addEventListener('DOMContentLoaded', function() {

  // Load header
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;

      // Set active navigation link based on current page
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.site-nav a');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });

      // Mobile nav toggle
      const toggle = document.querySelector('.nav-toggle');
      const nav = document.querySelector('.site-nav');

      if (toggle && nav) {
        toggle.addEventListener('click', function() {
          nav.classList.toggle('nav-open');
          toggle.classList.toggle('active');
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
              document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('dropdown-open'));
            }
          });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
          if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('nav-open');
            toggle.classList.remove('active');
            document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('dropdown-open'));
          }
        });
      }
    });

  // Load footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });
});
// Load header and footer on all pages
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
      const toggle = document.querySelector(".nav-toggle");
      const nav = document.querySelector(".site-nav");
      
      if (toggle && nav) {
        toggle.addEventListener("click", function() {
          nav.classList.toggle("nav-open");
          toggle.classList.toggle("active");
        });
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
          link.addEventListener('click', function() {
            nav.classList.remove('nav-open');
            toggle.classList.remove('active');
          });
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
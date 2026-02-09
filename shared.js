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
      
      // Set up login button after header is loaded
      setupLoginButton();
    });
  
  // Load footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });
});

// ==================== NETLIFY IDENTITY ====================

// Load the Netlify Identity widget script
const identityScript = document.createElement('script');
identityScript.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
document.head.appendChild(identityScript);

// Set up login button functionality
function setupLoginButton() {
  // Wait a moment for the button to exist in DOM
  setTimeout(function() {
    const loginLink = document.getElementById('login-link');
    
    if (loginLink) {
      loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if netlifyIdentity is available
        if (typeof netlifyIdentity !== 'undefined') {
          const user = netlifyIdentity.currentUser();
          
          if (user) {
            // User is logged in, go to admin
            window.location.href = '/admin.html';
          } else {
            // User not logged in, show login popup
            netlifyIdentity.open('login');
          }
        } else {
          console.error('Netlify Identity not loaded');
          alert('Login system is loading, please try again in a moment.');
        }
      });
    }
  }, 100);
}

// Wait for Identity script to load, then set up listeners
identityScript.addEventListener('load', function() {
  console.log('Netlify Identity widget loaded successfully');
  
  // Listen for login
  if (typeof netlifyIdentity !== 'undefined') {
    netlifyIdentity.on('login', function(user) {
      console.log('User logged in:', user.email);
      
      // Check if user has admin role
      const roles = user.app_metadata?.roles || [];
      if (roles.includes('admin')) {
        window.location.href = '/admin.html';
      } else {
        alert('You do not have admin access.');
      }
    });
    
    // Listen for logout
    netlifyIdentity.on('logout', function() {
      console.log('User logged out');
      
      // Update login button
      const loginLink = document.getElementById('login-link');
      if (loginLink) {
        loginLink.textContent = 'Login';
        loginLink.style.color = '#ff6b35';
      }
      
      // Redirect if on admin page
      if (window.location.pathname.includes('admin')) {
        window.location.href = '/index.html';
      }
    });
    
    // Update button text based on login state
    netlifyIdentity.on('init', function(user) {
      const loginLink = document.getElementById('login-link');
      if (loginLink && user) {
        loginLink.textContent = 'Admin';
        loginLink.style.color = '#8b5cf6';
      }
    });
  }
});
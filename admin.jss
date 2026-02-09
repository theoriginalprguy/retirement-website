// Admin Dashboard JavaScript

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  initializeSectionNavigation();
  initializePhotoUpload();
  initializeContentEditor();
  loadCurrentPhotos();
});

// ==================== AUTHENTICATION ====================

function checkAuth() {
  const user = netlifyIdentity.currentUser();
  
  if (!user) {
    // Redirect to home page with login prompt
    window.location.href = '/index.html';
    netlifyIdentity.open('login');
    return;
  }
  
  // Check if user has admin role
  const roles = user.app_metadata?.roles || [];
  if (!roles.includes('admin')) {
    alert('You do not have admin access. Contact the site administrator.');
    window.location.href = '/index.html';
    return;
  }
  
  // Update user info in sidebar
  document.getElementById('admin-username').textContent = user.user_metadata?.full_name || user.email;
  document.getElementById('userEmail').textContent = user.email;
}

// Logout functionality
document.getElementById('logout-btn')?.addEventListener('click', function() {
  netlifyIdentity.logout();
  window.location.href = '/index.html';
});

// ==================== SECTION NAVIGATION ====================

function initializeSectionNavigation() {
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const sections = document.querySelectorAll('.admin-section');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetSection = this.getAttribute('data-section');
      
      // Update active button
      navBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Show target section
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `section-${targetSection}`) {
          section.classList.add('active');
        }
      });
    });
  });
}

// ==================== PHOTO UPLOAD (CLOUDINARY) ====================

let cloudinaryConfig = {
  cloudName: 'dlxmgewap',
  uploadPreset: 'david-kirk-gallery'
};

function initializePhotoUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const photoInput = document.getElementById('photoInput');
  
  // Drag and drop functionality
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  
  uploadArea.addEventListener('dragleave', function() {
    uploadArea.classList.remove('drag-over');
  });
  
  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    handlePhotoUpload(files);
  });
  
  // File input change
  photoInput.addEventListener('change', function() {
    const files = Array.from(this.files);
    handlePhotoUpload(files);
  });
}

async function handlePhotoUpload(files) {
  const validFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (validFiles.length === 0) {
    showUploadResult('Please select valid image files.', 'error');
    return;
  }
  
  // Show progress
  document.getElementById('uploadProgress').style.display = 'block';
  document.getElementById('uploadResults').innerHTML = '';
  
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  let uploadedCount = 0;
  const totalFiles = validFiles.length;
  
  for (const file of validFiles) {
    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file);
      
      if (result.success) {
        showUploadResult(`✓ ${file.name} uploaded successfully`, 'success');
        
        // Add to gallery.html
        await addPhotoToGallery(result.url, file.name);
      } else {
        showUploadResult(`✗ Failed to upload ${file.name}`, 'error');
      }
      
    } catch (error) {
      showUploadResult(`✗ Error uploading ${file.name}: ${error.message}`, 'error');
    }
    
    uploadedCount++;
    const progress = (uploadedCount / totalFiles) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Uploading ${uploadedCount} of ${totalFiles}...`;
  }
  
  // Hide progress after completion
  setTimeout(() => {
    document.getElementById('uploadProgress').style.display = 'none';
    progressFill.style.width = '0%';
  }, 2000);
  
  // Reload current photos
  loadCurrentPhotos();
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', 'david-kirk-gallery');
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function addPhotoToGallery(imageUrl, fileName) {
  // This would typically call a Netlify Function to update gallery.html
  // For now, we'll show instructions to manually add
  console.log('Add to gallery:', imageUrl, fileName);
  
  // In production, you'd call a serverless function:
  /*
  await fetch('/.netlify/functions/add-to-gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, fileName })
  });
  */
}

function showUploadResult(message, type) {
  const resultsDiv = document.getElementById('uploadResults');
  const resultItem = document.createElement('div');
  resultItem.className = `upload-result ${type}`;
  resultItem.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  resultsDiv.appendChild(resultItem);
}

function loadCurrentPhotos() {
  // Load photos from gallery.html
  // In production, this would fetch from your gallery data source
  const photosGrid = document.getElementById('currentPhotos');
  
  // For demo purposes, show placeholder
  photosGrid.innerHTML = `
    <p class="help-text">Photos will appear here once you upload them. 
    Currently showing photos from gallery.html:</p>
  `;
  
  // You could parse gallery.html or fetch from a JSON file
  // For now, we'll just show the instruction
}

// ==================== CONTENT EDITOR (TINYMCE) ====================

let tinymceEditor = null;
let currentEditingPage = null;

function initializeContentEditor() {
  const pageBtns = document.querySelectorAll('.page-btn');
  
  pageBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const pageName = this.getAttribute('data-page');
      loadPageForEditing(pageName);
      
      pageBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Save button
  document.getElementById('saveContentBtn')?.addEventListener('click', savePageContent);
}

async function loadPageForEditing(pageName) {
  currentEditingPage = pageName;
  
  // Show editor card
  document.getElementById('editorCard').style.display = 'block';
  document.getElementById('editingPageTitle').querySelector('span').textContent = pageName;
  
  try {
    // Fetch page content
    const response = await fetch(pageName);
    const html = await response.text();
    
    // Initialize TinyMCE if not already initialized
    if (!tinymceEditor) {
      tinymce.init({
        selector: '#contentEditor',
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help',
        content_style: 'body { font-family:system-ui,sans-serif; font-size:14px }',
        setup: function(editor) {
          tinymceEditor = editor;
          editor.on('init', function() {
            editor.setContent(html);
          });
        }
      });
    } else {
      tinymceEditor.setContent(html);
    }
    
  } catch (error) {
    showSaveStatus(`Error loading ${pageName}: ${error.message}`, 'error');
  }
}

async function savePageContent() {
  if (!tinymceEditor || !currentEditingPage) {
    showSaveStatus('No page selected for editing', 'error');
    return;
  }
  
  const content = tinymceEditor.getContent();
  
  try {
    // Call Netlify Function to save content
    const response = await fetch('/.netlify/functions/save-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: currentEditingPage,
        content: content
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content');
    }
    
    showSaveStatus(`✓ ${currentEditingPage} saved successfully!`, 'success');
    
  } catch (error) {
    showSaveStatus(`✗ Error saving: ${error.message}. Changes saved locally but not deployed.`, 'error');
    
    // Fallback: Download the content as a file
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentEditingPage;
    a.click();
  }
}

function showSaveStatus(message, type) {
  const statusDiv = document.getElementById('saveStatus');
  statusDiv.textContent = message;
  statusDiv.className = `save-status ${type}`;
  statusDiv.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

// ==================== NETLIFY IDENTITY LISTENERS ====================

netlifyIdentity.on('init', user => {
  if (!user) {
    netlifyIdentity.open('login');
  }
});

netlifyIdentity.on('login', user => {
  checkAuth();
});

netlifyIdentity.on('logout', () => {
  window.location.href = '/index.html';
});
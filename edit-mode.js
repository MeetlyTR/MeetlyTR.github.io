// Edit Mode - Direct Page Editing
// Bu script sayfaları doğrudan düzenlenebilir yapar

let editMode = false;
const EDIT_KEY = 'editModeEnabled';

// Check if edit mode is enabled
function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit') === 'true' || localStorage.getItem(EDIT_KEY) === 'true') {
    enableEditMode();
  }
}

// Enable edit mode
function enableEditMode() {
  editMode = true;
  localStorage.setItem(EDIT_KEY, 'true');
  
  // Add edit mode indicator
  const indicator = document.createElement('div');
  indicator.id = 'edit-mode-indicator';
  indicator.innerHTML = '✏️ Edit Mode Active - Click on text to edit';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #6366f1;
    color: white;
    padding: 1rem;
    text-align: center;
    z-index: 10000;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  document.body.insertBefore(indicator, document.body.firstChild);
  
  // Make all text elements editable
  const editableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th, a, button');
  editableElements.forEach(el => {
    if (!el.closest('nav') && !el.closest('footer') && !el.closest('#edit-mode-indicator')) {
      el.contentEditable = true;
      el.style.outline = '2px dashed transparent';
      el.addEventListener('mouseenter', function() {
        if (editMode) {
          this.style.outline = '2px dashed #6366f1';
          this.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
        }
      });
      el.addEventListener('mouseleave', function() {
        if (editMode) {
          this.style.outline = '2px dashed transparent';
          this.style.backgroundColor = 'transparent';
        }
      });
      el.addEventListener('blur', function() {
        saveEdit(this);
      });
    }
  });
  
  // Add save button
  const saveButton = document.createElement('button');
  saveButton.id = 'edit-save-button';
  saveButton.innerHTML = '💾 Save Changes';
  saveButton.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #10b981;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-weight: bold;
  `;
  saveButton.onclick = saveAllChanges;
  document.body.appendChild(saveButton);
  
  // Add exit button
  const exitButton = document.createElement('button');
  exitButton.id = 'edit-exit-button';
  exitButton.innerHTML = '❌ Exit Edit Mode';
  exitButton.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 12rem;
    background: #ef4444;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-weight: bold;
  `;
  exitButton.onclick = disableEditMode;
  document.body.appendChild(exitButton);
}

// Disable edit mode
function disableEditMode() {
  editMode = false;
  localStorage.removeItem(EDIT_KEY);
  
  // Remove indicator
  const indicator = document.getElementById('edit-mode-indicator');
  if (indicator) indicator.remove();
  
  // Remove buttons
  const saveButton = document.getElementById('edit-save-button');
  if (saveButton) saveButton.remove();
  const exitButton = document.getElementById('edit-exit-button');
  if (exitButton) exitButton.remove();
  
  // Remove editable
  const editableElements = document.querySelectorAll('[contenteditable="true"]');
  editableElements.forEach(el => {
    el.contentEditable = false;
    el.style.outline = 'none';
    el.style.backgroundColor = 'transparent';
  });
  
  // Reload page
  window.location.href = window.location.pathname;
}

// Save edit
function saveEdit(element) {
  const key = element.getAttribute('data-i18n') || element.id || element.className;
  const value = element.textContent;
  
  // Save to localStorage
  const edits = JSON.parse(localStorage.getItem('pageEdits') || '{}');
  edits[key] = value;
  localStorage.setItem('pageEdits', JSON.stringify(edits));
}

// Save all changes
function saveAllChanges() {
  const edits = JSON.parse(localStorage.getItem('pageEdits') || '{}');
  
  // Create export data
  const exportData = {
    edits: edits,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  };
  
  // Download as JSON
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `page-edits-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Changes saved! JSON file downloaded. You can apply these changes to your source files.');
}

// Image upload handler for edit mode
function handleImageEdit(img) {
  if (!editMode) return;
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        img.src = e.target.result;
        // Save to localStorage
        const imageEdits = JSON.parse(localStorage.getItem('imageEdits') || '{}');
        imageEdits[img.src] = e.target.result;
        localStorage.setItem('imageEdits', JSON.stringify(imageEdits));
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Make images editable
function makeImagesEditable() {
  if (!editMode) return;
  
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.style.cursor = 'pointer';
    img.style.border = '2px dashed transparent';
    img.addEventListener('mouseenter', function() {
      if (editMode) {
        this.style.border = '2px dashed #6366f1';
      }
    });
    img.addEventListener('mouseleave', function() {
      if (editMode) {
        this.style.border = '2px dashed transparent';
      }
    });
    img.addEventListener('click', function() {
      if (editMode) {
        handleImageEdit(this);
      }
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  checkEditMode();
  if (editMode) {
    makeImagesEditable();
  }
});

// Enable edit mode via URL parameter or localStorage
// Usage: ?edit=true or set localStorage.setItem('editModeEnabled', 'true')


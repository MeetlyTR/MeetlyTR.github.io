// Professional Edit Mode - Direct Page Editing
// Sayfa üzerinde direkt düzenleme yapabilme sistemi

let editMode = false;
let originalContent = {};
const EDIT_KEY = 'editModeEnabled';

// Toggle edit mode
function toggleEditMode() {
  if (editMode) {
    disableEditMode();
  } else {
    enableEditMode();
  }
}

// Enable edit mode
function enableEditMode() {
  editMode = true;
  document.body.classList.add('edit-mode-active');
  document.getElementById('editButton').classList.add('active');
  document.getElementById('editButton').innerHTML = '✓';
  document.getElementById('editToolbar').classList.add('show');
  
  // Save original content
  saveOriginalContent();
  
  // Make elements editable
  makeElementsEditable();
  
  // Add edit indicators
  addEditIndicators();
  
  // Show notification
  showNotification('✏️ Düzenleme modu aktif - Metinlerin üzerine tıklayarak düzenleyebilirsiniz', 'success');
}

// Disable edit mode
function disableEditMode() {
  editMode = false;
  document.body.classList.remove('edit-mode-active');
  document.getElementById('editButton').classList.remove('active');
  document.getElementById('editButton').innerHTML = '✏️';
  document.getElementById('editToolbar').classList.remove('show');
  
  // Remove editable
  removeEditable();
  
  // Remove indicators
  removeEditIndicators();
}

// Cancel edit mode
function cancelEditMode() {
  if (confirm('Değişiklikleri iptal etmek istediğinize emin misiniz? Tüm değişiklikler kaybolacak.')) {
    // Restore original content
    restoreOriginalContent();
    disableEditMode();
    showNotification('Değişiklikler iptal edildi', 'info');
  }
}

// Save original content
function saveOriginalContent() {
  const editableElements = document.querySelectorAll('[data-i18n]');
  editableElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    originalContent[key] = {
      text: el.textContent,
      html: el.innerHTML,
      element: el
    };
  });
}

// Restore original content
function restoreOriginalContent() {
  Object.keys(originalContent).forEach(key => {
    const data = originalContent[key];
    if (data.element) {
      data.element.textContent = data.text;
    }
  });
}

// Make elements editable
function makeElementsEditable() {
  // Add data-editable attribute to translatable elements
  const editableElements = document.querySelectorAll('[data-i18n]');
  editableElements.forEach(el => {
    // Skip navigation, footer, and buttons
    if (!el.closest('nav') && !el.closest('footer') && !el.closest('.edit-toolbar') && !el.closest('.edit-button')) {
      el.setAttribute('data-editable', 'true');
      el.contentEditable = true;
      
      // Add placeholder if empty
      if (!el.textContent.trim()) {
        el.setAttribute('data-placeholder', 'Buraya tıklayarak metin ekleyin...');
      }
    }
  });
  
  // Make images editable
  const images = document.querySelectorAll('img:not([src*="data:"])');
  images.forEach(img => {
    img.style.cursor = 'pointer';
    img.setAttribute('data-editable-image', 'true');
    img.addEventListener('click', function() {
      if (editMode) {
        handleImageEdit(this);
      }
    });
  });
}

// Remove editable
function removeEditable() {
  const editableElements = document.querySelectorAll('[data-editable]');
  editableElements.forEach(el => {
    el.removeAttribute('data-editable');
    el.contentEditable = false;
    
    // Remove edit indicators
    const indicator = el.querySelector('.edit-indicator');
    if (indicator) {
      indicator.remove();
    }
  });
  
  const images = document.querySelectorAll('[data-editable-image]');
  images.forEach(img => {
    img.removeAttribute('data-editable-image');
    img.style.cursor = 'default';
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  });
}

// Add edit indicators
function addEditIndicators() {
  const editableElements = document.querySelectorAll('[data-editable]');
  editableElements.forEach(el => {
    el.addEventListener('focus', function() {
      this.style.outline = '2px solid #6366f1';
      this.style.outlineOffset = '2px';
    });
    
    el.addEventListener('blur', function() {
      this.style.outline = '';
      this.style.outlineOffset = '';
      // Save change
      saveElementChange(this);
    });
  });
}

// Remove edit indicators
function removeEditIndicators() {
  // Styles are removed automatically when contentEditable is removed
}

// Save element change
function saveElementChange(element) {
  const key = element.getAttribute('data-i18n');
  if (key) {
    const changes = JSON.parse(localStorage.getItem('pageChanges') || '{}');
    changes[key] = {
      text: element.textContent,
      html: element.innerHTML,
      timestamp: Date.now()
    };
    localStorage.setItem('pageChanges', JSON.stringify(changes));
  }
}

// Save page changes
function savePageChanges() {
  const changes = JSON.parse(localStorage.getItem('pageChanges') || '{}');
  
  if (Object.keys(changes).length === 0) {
    showNotification('Değişiklik yapılmadı', 'info');
    return;
  }
  
  // Create export data
  const exportData = {
    changes: changes,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    translations: {}
  };
  
  // Update translations object
  Object.keys(changes).forEach(key => {
    const change = changes[key];
    // Extract language from current language
    const currentLang = window.i18n ? window.i18n.currentLang : 'en';
    if (!exportData.translations[currentLang]) {
      exportData.translations[currentLang] = {};
    }
    
    // Create nested object from key (e.g., "hero.title" -> {hero: {title: value}})
    const keys = key.split('.');
    let obj = exportData.translations[currentLang];
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = change.text;
  });
  
  // Download as JSON
  downloadJSONFile('page-changes.json', JSON.stringify(exportData, null, 2));
  
  // Also update translations.json structure
  updateTranslationsJSON(exportData.translations);
  
  showNotification('✅ Değişiklikler kaydedildi! JSON dosyası indirildi.', 'success');
  
  // Clear changes
  localStorage.removeItem('pageChanges');
  originalContent = {};
}

// Update translations JSON
function updateTranslationsJSON(translations) {
  // Load current translations
  fetch('translations.json')
    .then(response => response.json())
    .then(data => {
      // Merge changes
      Object.keys(translations).forEach(lang => {
        if (!data[lang]) {
          data[lang] = {};
        }
        data[lang] = deepMerge(data[lang], translations[lang]);
      });
      
      // Download updated translations
      downloadJSONFile('translations-updated.json', JSON.stringify(data, null, 2));
    })
    .catch(error => {
      console.error('Error loading translations:', error);
    });
}

// Deep merge objects
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Export page data
function exportPageData() {
  const changes = JSON.parse(localStorage.getItem('pageChanges') || '{}');
  const exportData = {
    changes: changes,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  };
  
  downloadJSONFile('page-data-export.json', JSON.stringify(exportData, null, 2));
  showNotification('📥 Veriler export edildi!', 'success');
}

// Handle image edit
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
        
        // Save image change
        const imageChanges = JSON.parse(localStorage.getItem('imageChanges') || '{}');
        imageChanges[img.src] = e.target.result;
        localStorage.setItem('imageChanges', JSON.stringify(imageChanges));
        
        showNotification('✅ Resim güncellendi!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Download JSON file
function downloadJSONFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.getElementById('edit-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.id = 'edit-notification';
  notification.textContent = message;
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#6366f1',
    warning: '#f59e0b'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 10001;
    animation: slideIn 0.3s ease-out;
    max-width: 350px;
    font-weight: 500;
    backdrop-filter: blur(10px);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for i18n to load
  setTimeout(() => {
    // Check if edit mode was previously enabled
    if (localStorage.getItem(EDIT_KEY) === 'true') {
      enableEditMode();
    }
    
    // Make edit button visible
    const editButton = document.getElementById('editButton');
    if (editButton) {
      editButton.style.display = 'flex';
    }
  }, 500);
});

// Make functions global
window.toggleEditMode = toggleEditMode;
window.savePageChanges = savePageChanges;
window.exportPageData = exportPageData;
window.cancelEditMode = cancelEditMode;

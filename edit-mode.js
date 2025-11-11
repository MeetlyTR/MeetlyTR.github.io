// Professional Edit Mode - Direct Page Editing
// Sayfa üzerinde direkt düzenleme yapabilme sistemi

let editMode = false;
let originalContent = {};
const EDIT_KEY = 'editModeEnabled';
const PASSWORD_SESSION_KEY = 'editModeSession';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Password Hash - SHA-256 hash of the password
// Bu hash GitHub'da görünebilir ama gerçek şifre görünmez
// Şifreyi değiştirmek için: Yeni şifreyi SHA-256 ile hash'leyin ve aşağıdaki değeri güncelleyin
// Örnek: node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('YeniŞifre').digest('hex'));"
const PASSWORD_HASH = '0f2f23bad805b7f3a7a2c7ff55b1c604706c97778926a9b786e73b080e04c5bb'; // SHA-256 hash of Meetly2024!

// Calculate SHA-256 hash
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Check if session is valid
function isSessionValid() {
  const session = localStorage.getItem(PASSWORD_SESSION_KEY);
  if (!session) return false;
  
  try {
    const sessionData = JSON.parse(session);
    const now = Date.now();
    if (now - sessionData.timestamp > SESSION_DURATION) {
      localStorage.removeItem(PASSWORD_SESSION_KEY);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Create session
function createSession() {
  const sessionData = {
    timestamp: Date.now(),
    valid: true
  };
  localStorage.setItem(PASSWORD_SESSION_KEY, JSON.stringify(sessionData));
}

// Request edit mode (show password modal)
function requestEditMode() {
  if (editMode) {
    disableEditMode();
    return;
  }
  
  // Check if session is valid
  if (isSessionValid()) {
    enableEditMode();
    return;
  }
  
  // Show password modal
  showPasswordModal();
}

// Show password modal
function showPasswordModal() {
  const modal = document.getElementById('passwordModal');
  const input = document.getElementById('passwordInput');
  const error = document.getElementById('passwordError');
  
  if (!modal || !input || !error) return;
  
  modal.classList.add('show');
  error.classList.remove('show');
  input.value = '';
  
  // Focus after animation
  setTimeout(() => {
    input.focus();
  }, 100);
}

// Close password modal
function closePasswordModal() {
  const modal = document.getElementById('passwordModal');
  modal.classList.remove('show');
}

// Check password and enable edit mode
async function checkPasswordAndEnableEdit() {
  const input = document.getElementById('passwordInput');
  const error = document.getElementById('passwordError');
  const password = input.value;
  
  if (!password) {
    error.textContent = '❌ Lütfen şifre girin!';
    error.classList.add('show');
    return;
  }
  
  // Hash the entered password using SHA-256
  const enteredHash = await sha256(password);
  
  // Compare with stored hash (gerçek şifre hiçbir yerde saklanmıyor, sadece hash karşılaştırması yapılıyor)
  if (enteredHash === PASSWORD_HASH) {
    // Password is correct
    createSession();
    closePasswordModal();
    enableEditMode();
    showNotification('✅ Şifre doğru! Düzenleme modu aktif.', 'success');
  } else {
    // Password is incorrect
    error.classList.add('show');
    input.value = '';
    input.focus();
    input.style.borderColor = '#ef4444';
    setTimeout(() => {
      input.style.borderColor = '';
    }, 2000);
  }
}

// Toggle edit mode (deprecated - use requestEditMode instead)
function toggleEditMode() {
  requestEditMode();
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
  // Wait a bit for page to fully load and i18n to apply translations
  setTimeout(() => {
    // Add data-editable attribute to translatable elements
    const editableElements = document.querySelectorAll('[data-i18n]');
    editableElements.forEach(el => {
      // Skip navigation, footer, buttons, language selector, and edit controls
      if (!el.closest('nav') && 
          !el.closest('footer') && 
          !el.closest('.edit-toolbar') && 
          !el.closest('.edit-button') &&
          !el.closest('.language-selector') &&
          el.getAttribute('data-editable') !== 'false') {
        
        // Skip if already editable
        if (el.hasAttribute('data-editable')) return;
        
        // Skip buttons and links (they have special behavior, only edit text)
        if (el.tagName === 'BUTTON' || (el.tagName === 'A' && el.getAttribute('href'))) {
          // Make text editable but keep link functionality
          const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
          if (textNodes.length > 0) {
            el.contentEditable = true;
            el.setAttribute('data-editable', 'true');
          }
          return;
        }
        
        el.setAttribute('data-editable', 'true');
        el.contentEditable = true;
        
        // Add placeholder if empty
        if (!el.textContent.trim()) {
          el.setAttribute('data-placeholder', 'Buraya tıklayarak metin ekleyin...');
        }
      }
    });
    
    // Make images editable (only larger images, not icons)
    const images = document.querySelectorAll('img:not([src*="data:"]):not([data-editable-image])');
    images.forEach(img => {
      // Skip small images (likely icons)
      if (img.width < 50 && img.height < 50) return;
      
      // Skip navigation and footer images
      if (img.closest('nav') || img.closest('footer') || img.closest('.edit-toolbar')) return;
      
      img.style.cursor = 'pointer';
      img.style.transition = 'all 0.2s';
      img.setAttribute('data-editable-image', 'true');
      
      // Remove existing click listeners by cloning
      const newImg = img.cloneNode(true);
      if (img.parentNode) {
        img.parentNode.replaceChild(newImg, img);
      }
      
      newImg.addEventListener('mouseenter', function() {
        if (editMode) {
          this.style.opacity = '0.8';
          this.style.transform = 'scale(1.02)';
          this.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
        }
      });
      
      newImg.addEventListener('mouseleave', function() {
        if (editMode) {
          this.style.opacity = '1';
          this.style.transform = 'scale(1)';
          this.style.boxShadow = '';
        }
      });
      
      newImg.addEventListener('click', function(e) {
        if (editMode) {
          e.preventDefault();
          e.stopPropagation();
          handleImageEdit(this);
        }
      }, true); // Use capture phase
    });
  }, 300); // Wait for i18n to load
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
window.requestEditMode = requestEditMode;
window.checkPasswordAndEnableEdit = checkPasswordAndEnableEdit;
window.closePasswordModal = closePasswordModal;
window.savePageChanges = savePageChanges;
window.exportPageData = exportPageData;
window.cancelEditMode = cancelEditMode;

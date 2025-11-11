// Admin Panel JavaScript

// Tab switching
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// Language switching
function showLang(lang, section) {
  // Hide all lang content
  document.querySelectorAll(`#${section}-en, #${section}-tr`).forEach(content => {
    content.classList.remove('active');
  });
  document.querySelectorAll(`.lang-tab`).forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected lang
  document.getElementById(`${section}-${lang}`).classList.add('active');
  event.target.classList.add('active');
}

// Image upload handler
function handleImageUpload(input, previewId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById(previewId);
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      
      // Save to localStorage as base64
      const storageKey = previewId.replace('-preview', '-image');
      localStorage.setItem(storageKey, e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Load translations.json
async function loadTranslations() {
  try {
    const response = await fetch('translations.json');
    const data = await response.json();
    
    // Load English translations
    if (data.en) {
      if (data.en.hero) {
        document.getElementById('hero-title-en').value = data.en.hero.title || '';
        document.getElementById('hero-subtitle-en').value = data.en.hero.subtitle || '';
        document.getElementById('hero-description-en').value = data.en.hero.description || '';
      }
      if (data.en.about) {
        document.getElementById('about-p1-en').value = data.en.about.p1 || '';
        document.getElementById('about-p2-en').value = data.en.about.p2 || '';
        document.getElementById('about-p3-en').value = data.en.about.p3 || '';
        document.getElementById('about-p4-en').value = data.en.about.p4 || '';
      }
      if (data.en.contact) {
        document.getElementById('contact-description-en').value = data.en.contact.description || '';
      }
    }
    
    // Load Turkish translations
    if (data.tr) {
      if (data.tr.hero) {
        document.getElementById('hero-title-tr').value = data.tr.hero.title || '';
        document.getElementById('hero-subtitle-tr').value = data.tr.hero.subtitle || '';
        document.getElementById('hero-description-tr').value = data.tr.hero.description || '';
      }
      if (data.tr.about) {
        document.getElementById('about-p1-tr').value = data.tr.about.p1 || '';
        document.getElementById('about-p2-tr').value = data.tr.about.p2 || '';
        document.getElementById('about-p3-tr').value = data.tr.about.p3 || '';
        document.getElementById('about-p4-tr').value = data.tr.about.p4 || '';
      }
      if (data.tr.contact) {
        document.getElementById('contact-description-tr').value = data.tr.contact.description || '';
      }
    }
    
    // Load full translations JSON
    document.getElementById('translations-json').value = JSON.stringify(data, null, 2);
    
    showAlert('Translations loaded successfully!', 'success');
  } catch (error) {
    console.error('Error loading translations:', error);
    showAlert('Error loading translations: ' + error.message, 'error');
  }
}

// Save Hero section
function saveHero() {
  const heroData = {
    en: {
      title: document.getElementById('hero-title-en').value,
      subtitle: document.getElementById('hero-subtitle-en').value,
      description: document.getElementById('hero-description-en').value
    },
    tr: {
      title: document.getElementById('hero-title-tr').value,
      subtitle: document.getElementById('hero-subtitle-tr').value,
      description: document.getElementById('hero-description-tr').value
    },
    bg_image: localStorage.getItem('hero-bg-image') || ''
  };
  
  localStorage.setItem('heroData', JSON.stringify(heroData));
  updateTranslationsJSON('hero', heroData);
  showAlert('Hero section saved!', 'success');
}

// Load Hero section
function loadHero() {
  loadTranslations();
  const saved = localStorage.getItem('heroData');
  if (saved) {
    const data = JSON.parse(saved);
    if (data.en) {
      document.getElementById('hero-title-en').value = data.en.title || '';
      document.getElementById('hero-subtitle-en').value = data.en.subtitle || '';
      document.getElementById('hero-description-en').value = data.en.description || '';
    }
    if (data.tr) {
      document.getElementById('hero-title-tr').value = data.tr.title || '';
      document.getElementById('hero-subtitle-tr').value = data.tr.subtitle || '';
      document.getElementById('hero-description-tr').value = data.tr.description || '';
    }
    if (data.bg_image) {
      document.getElementById('hero-bg-preview').innerHTML = `<img src="${data.bg_image}" alt="Preview">`;
    }
  }
}

// Save About section
function saveAbout() {
  const aboutData = {
    en: {
      p1: document.getElementById('about-p1-en').value,
      p2: document.getElementById('about-p2-en').value,
      p3: document.getElementById('about-p3-en').value,
      p4: document.getElementById('about-p4-en').value
    },
    tr: {
      p1: document.getElementById('about-p1-tr').value,
      p2: document.getElementById('about-p2-tr').value,
      p3: document.getElementById('about-p3-tr').value,
      p4: document.getElementById('about-p4-tr').value
    },
    profile_image: localStorage.getItem('about-profile-image') || ''
  };
  
  localStorage.setItem('aboutData', JSON.stringify(aboutData));
  updateTranslationsJSON('about', aboutData);
  showAlert('About section saved!', 'success');
}

// Load About section
function loadAbout() {
  loadTranslations();
  const saved = localStorage.getItem('aboutData');
  if (saved) {
    const data = JSON.parse(saved);
    if (data.en) {
      document.getElementById('about-p1-en').value = data.en.p1 || '';
      document.getElementById('about-p2-en').value = data.en.p2 || '';
      document.getElementById('about-p3-en').value = data.en.p3 || '';
      document.getElementById('about-p4-en').value = data.en.p4 || '';
    }
    if (data.tr) {
      document.getElementById('about-p1-tr').value = data.tr.p1 || '';
      document.getElementById('about-p2-tr').value = data.tr.p2 || '';
      document.getElementById('about-p3-tr').value = data.tr.p3 || '';
      document.getElementById('about-p4-tr').value = data.tr.p4 || '';
    }
    if (data.profile_image) {
      document.getElementById('about-profile-preview').innerHTML = `<img src="${data.profile_image}" alt="Preview">`;
    }
  }
}

// Save Contact section
function saveContact() {
  const contactData = {
    email: document.getElementById('contact-email').value,
    linkedin: document.getElementById('contact-linkedin').value,
    github: document.getElementById('contact-github').value,
    en: {
      description: document.getElementById('contact-description-en').value
    },
    tr: {
      description: document.getElementById('contact-description-tr').value
    }
  };
  
  localStorage.setItem('contactData', JSON.stringify(contactData));
  updateTranslationsJSON('contact', contactData);
  showAlert('Contact information saved!', 'success');
}

// Load Contact section
function loadContact() {
  loadTranslations();
  const saved = localStorage.getItem('contactData');
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById('contact-email').value = data.email || '';
    document.getElementById('contact-linkedin').value = data.linkedin || '';
    document.getElementById('contact-github').value = data.github || '';
    if (data.en) {
      document.getElementById('contact-description-en').value = data.en.description || '';
    }
    if (data.tr) {
      document.getElementById('contact-description-tr').value = data.tr.description || '';
    }
  }
}

// Update translations JSON
function updateTranslationsJSON(section, data) {
  try {
    const currentJSON = document.getElementById('translations-json').value;
    const translations = currentJSON ? JSON.parse(currentJSON) : { en: {}, tr: {} };
    
    if (section === 'hero') {
      if (!translations.en) translations.en = {};
      if (!translations.tr) translations.tr = {};
      translations.en.hero = data.en;
      translations.tr.hero = data.tr;
    } else if (section === 'about') {
      if (!translations.en) translations.en = {};
      if (!translations.tr) translations.tr = {};
      translations.en.about = data.en;
      translations.tr.about = data.tr;
    } else if (section === 'contact') {
      if (!translations.en) translations.en = {};
      if (!translations.tr) translations.tr = {};
      translations.en.contact = { ...data.en, email: data.email, linkedin: data.linkedin, github: data.github };
      translations.tr.contact = { ...data.tr, email: data.email, linkedin: data.linkedin, github: data.github };
    }
    
    document.getElementById('translations-json').value = JSON.stringify(translations, null, 2);
  } catch (error) {
    console.error('Error updating translations JSON:', error);
  }
}

// Save Translations
function saveTranslations() {
  try {
    const jsonText = document.getElementById('translations-json').value;
    const translations = JSON.parse(jsonText);
    localStorage.setItem('translationsData', jsonText);
    
    // Download as file
    downloadJSONFile('translations.json', jsonText);
    showAlert('Translations saved and downloaded!', 'success');
  } catch (error) {
    showAlert('Error saving translations: ' + error.message, 'error');
  }
}

// Load Translations JSON editor
function loadTranslationsEditor() {
  loadTranslations();
}

// Export all data
function exportData() {
  const allData = {
    hero: JSON.parse(localStorage.getItem('heroData') || '{}'),
    about: JSON.parse(localStorage.getItem('aboutData') || '{}'),
    contact: JSON.parse(localStorage.getItem('contactData') || '{}'),
    translations: localStorage.getItem('translationsData') ? JSON.parse(localStorage.getItem('translationsData')) : {}
  };
  
  downloadJSONFile('site-data-export.json', JSON.stringify(allData, null, 2));
  showAlert('All data exported!', 'success');
}

// Import data
function importData(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.hero) {
          localStorage.setItem('heroData', JSON.stringify(data.hero));
          loadHero();
        }
        if (data.about) {
          localStorage.setItem('aboutData', JSON.stringify(data.about));
          loadAbout();
        }
        if (data.contact) {
          localStorage.setItem('contactData', JSON.stringify(data.contact));
          loadContact();
        }
        if (data.translations) {
          localStorage.setItem('translationsData', JSON.stringify(data.translations));
          document.getElementById('translations-json').value = JSON.stringify(data.translations, null, 2);
        }
        showAlert('Data imported successfully!', 'success');
      } catch (error) {
        showAlert('Error importing data: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }
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

// Download translations.json
function downloadJSON() {
  const jsonText = document.getElementById('translations-json').value;
  downloadJSONFile('translations.json', jsonText);
  showAlert('translations.json downloaded!', 'success');
}

// Show alert
function showAlert(message, type) {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert ${type} show`;
  setTimeout(() => {
    alert.classList.remove('show');
  }, 3000);
}

// Add Service
function addService() {
  // TODO: Implement service addition
  showAlert('Service addition feature coming soon!', 'success');
}

// Add Project
function addProject() {
  // TODO: Implement project addition
  showAlert('Project addition feature coming soon!', 'success');
}

// Add Experience
function addExperience() {
  // TODO: Implement experience addition
  showAlert('Experience addition feature coming soon!', 'success');
}

// Initialize on page load - Only if admin panel is visible
// Authentication check is handled in admin.html
function initializeAdmin() {
  // Load translations on page load
  if (typeof loadTranslations === 'function') {
    loadTranslations();
  }
  
  // Load saved data from localStorage
  if (typeof loadHero === 'function') {
    loadHero();
  }
  if (typeof loadAbout === 'function') {
    loadAbout();
  }
  if (typeof loadContact === 'function') {
    loadContact();
  }
}

// Wait for admin panel to be shown before initializing
document.addEventListener('DOMContentLoaded', function() {
  // Check if admin panel is visible (user is authenticated)
  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel && adminPanel.classList.contains('show')) {
    initializeAdmin();
  }
});


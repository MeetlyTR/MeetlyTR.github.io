// Internationalization System
class I18n {
  constructor() {
    this.translations = {};
    this.currentLang = this.detectLanguage();
    this.loadTranslations();
  }

  detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) return savedLang;

    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam) return langParam;

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Supported languages
    const supportedLangs = ['tr', 'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar', 
                           'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'ro', 'bg', 'el', 'hr', 
                           'sr', 'sk', 'sl', 'uk', 'et', 'lv', 'lt', 'he', 'th', 'vi', 'hi', 'id', 'ms', 'tl'];
    
    if (supportedLangs.includes(langCode)) {
      return langCode;
    }

    // Default to English
    return 'en';
  }

  async loadTranslations() {
    try {
      const response = await fetch('translations.json');
      this.translations = await response.json();
      this.updatePage();
      this.updateLanguageSelector();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback: keep default content
    }
  }

  t(key, params = {}) {
    if (!this.translations[this.currentLang]) {
      return key;
    }
    
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    let fallbackValue = this.translations['en'];
    
    // Navigate through the translation object
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const numKey = parseInt(k);
      const isNumeric = !isNaN(numKey) && isFinite(k);
      
      // Try current language first
      if (value !== undefined && value !== null) {
        if (isNumeric && Array.isArray(value)) {
          value = value[numKey];
        } else if (!isNumeric && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
        }
      }
      
      // Fallback to English if not found
      if (value === undefined && fallbackValue !== undefined && fallbackValue !== null) {
        if (isNumeric && Array.isArray(fallbackValue)) {
          value = fallbackValue[numKey];
        } else if (!isNumeric && typeof fallbackValue === 'object' && k in fallbackValue) {
          value = fallbackValue[k];
          fallbackValue = fallbackValue[k];
        } else {
          return key; // Translation not found
        }
      } else if (value !== undefined && fallbackValue !== undefined && fallbackValue !== null) {
        // Update fallback value for next iteration
        if (isNumeric && Array.isArray(fallbackValue)) {
          fallbackValue = fallbackValue[numKey];
        } else if (!isNumeric && typeof fallbackValue === 'object' && k in fallbackValue) {
          fallbackValue = fallbackValue[k];
        }
      }
      
      if (value === undefined) {
        return key;
      }
    }

    // Replace placeholders
    if (typeof value === 'string') {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }

    return value || key;
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('preferred-language', lang);
      this.updatePage();
      this.updateLanguageSelector();
      
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.pushState({}, '', url);
    }
  }

  updatePage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      
      // Get params from data-i18n-params attribute if exists
      let params = {};
      const paramsAttr = element.getAttribute('data-i18n-params');
      if (paramsAttr) {
        try {
          params = JSON.parse(paramsAttr);
        } catch (e) {
          console.warn('Invalid data-i18n-params:', paramsAttr);
        }
      }
      
      // Special handling for footer year
      if (key === 'footer.text' && !params.year) {
        params.year = new Date().getFullYear();
      }
      
      const translation = this.t(key, params);
      
      // Handle HTML content
      if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = this.parseMarkdown(translation);
      } else {
        // For footer, preserve the year span structure
        if (key === 'footer.text' && element.querySelector('#year')) {
          const year = new Date().getFullYear();
          const yearEl = element.querySelector('#year');
          if (yearEl) {
            yearEl.textContent = year;
            // Replace {year} in translation text but keep the span
            let translatedText = translation.replace('{year}', year);
            // Update text nodes around the year span
            const textNodes = Array.from(element.childNodes).filter(n => n.nodeType === 3);
            if (textNodes.length > 0) {
              textNodes[0].textContent = translatedText.split(year.toString())[0];
              if (textNodes.length > 1) {
                textNodes[1].textContent = translatedText.split(year.toString())[1] || '';
              }
            }
          }
        } else {
          // Replace {year} placeholder with actual year if it exists
          let finalTranslation = translation;
          if (finalTranslation.includes('{year}')) {
            const year = new Date().getFullYear();
            finalTranslation = finalTranslation.replace(/{year}/g, year);
          }
          element.textContent = finalTranslation;
        }
      }
    });

    // Update title
    document.title = this.t('hero.title') + ' - Muzaffer Karafil';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = this.t('hero.description');
    }

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;

    // Update direction for RTL languages
    if (['ar', 'he'].includes(this.currentLang)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  parseMarkdown(text) {
    // Simple markdown parser for bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace {year} with actual year in HTML
    if (text.includes('{year}')) {
      const year = new Date().getFullYear();
      text = text.replace('{year}', `<span id="year">${year}</span>`);
    }
    return text;
  }

  updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
      selector.value = this.currentLang;
    }
  }

  getAvailableLanguages() {
    return Object.keys(this.translations).map(code => ({
      code,
      name: this.getLanguageName(code)
    }));
  }

  getLanguageName(code) {
    const names = {
      'tr': 'Türkçe', 'en': 'English', 'de': 'Deutsch', 'fr': 'Français', 'es': 'Español',
      'it': 'Italiano', 'pt': 'Português', 'ru': 'Русский', 'ja': '日本語', 'zh': '中文',
      'ko': '한국어', 'ar': 'العربية', 'nl': 'Nederlands', 'sv': 'Svenska', 'no': 'Norsk',
      'da': 'Dansk', 'fi': 'Suomi', 'pl': 'Polski', 'cs': 'Čeština', 'hu': 'Magyar',
      'ro': 'Română', 'bg': 'Български', 'el': 'Ελληνικά', 'hr': 'Hrvatski', 'sr': 'Српски',
      'sk': 'Slovenčina', 'sl': 'Slovenščina', 'uk': 'Українська', 'et': 'Eesti', 'lv': 'Latviešu',
      'lt': 'Lietuvių', 'he': 'עברית', 'th': 'ไทย', 'vi': 'Tiếng Việt', 'hi': 'हिन्दी',
      'id': 'Bahasa Indonesia', 'ms': 'Bahasa Melayu', 'tl': 'Filipino'
    };
    return names[code] || code;
  }
}

// Initialize i18n when DOM is ready
let i18n;
document.addEventListener('DOMContentLoaded', () => {
  i18n = new I18n();
  window.i18n = i18n; // Export for global use
  
  // Language selector event
  const selector = document.getElementById('language-selector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
    });
  }
});

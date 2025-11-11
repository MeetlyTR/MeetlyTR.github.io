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

    // Default to Turkish
    return 'tr';
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
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to Turkish if translation not found
        value = this.translations['tr'];
        for (const k2 of keys) {
          if (value && value[k2]) {
            value = value[k2];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    // Replace placeholders
    if (typeof value === 'string') {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param]);
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
      const translation = this.t(key);
      
      // Handle HTML content
      if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = this.parseMarkdown(translation);
      } else {
        element.textContent = translation;
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
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
  
  // Language selector event
  const selector = document.getElementById('language-selector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
    });
  }
});

// Export for global use
window.i18n = i18n;


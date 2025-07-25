console.log('[LanguageManager] language.js loaded');
/**
 * Language Manager
 * Handles language switching and text localization
 */
const languageManager = {
    currentLang: 'en',
    
    // Translations for UI elements
// File ini sudah tidak digunakan. Logic multi bahasa ada di index.html
    
    /**
     * Initialize language manager
     */
    init() {
        // Check localStorage for saved language preference
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && (savedLang === 'en' || savedLang === 'id')) {
            this.currentLang = savedLang;
        }
        
        // Set initial language
        this.setLanguage(this.currentLang, false);
        
        // Add event listeners to language buttons
        const btnEn = document.getElementById('lang-en');
        const btnId = document.getElementById('lang-id');
        if (btnEn) {
            btnEn.addEventListener('click', () => this.setLanguage('en'));
            console.log('[LanguageManager] lang-en button found and event attached');
        } else {
            console.error('[LanguageManager] lang-en button NOT found');
        }
        if (btnId) {
            btnId.addEventListener('click', () => this.setLanguage('id'));
            console.log('[LanguageManager] lang-id button found and event attached');
        } else {
            console.error('[LanguageManager] lang-id button NOT found');
        }

        // Desktop language buttons
        const btnEnDesktop = document.getElementById('lang-en-desktop');
        const btnIdDesktop = document.getElementById('lang-id-desktop');
        if (btnEnDesktop) {
            btnEnDesktop.addEventListener('click', () => this.setLanguage('en'));
            console.log('[LanguageManager] lang-en-desktop button found and event attached');
        } else {
            console.warn('[LanguageManager] lang-en-desktop button NOT found');
        }
        if (btnIdDesktop) {
            btnIdDesktop.addEventListener('click', () => this.setLanguage('id'));
            console.log('[LanguageManager] lang-id-desktop button found and event attached');
        } else {
            console.warn('[LanguageManager] lang-id-desktop button NOT found');
        }

        // Make languageManager global for debugging
        window.languageManager = this;

        console.log('Language manager initialized with language:', this.currentLang);
    },
    
    /**
     * Set the application language
     * @param {string} lang - Language code ('en' or 'id')
     * @param {boolean} loadData - Whether to load new data (default: true)
     */
    setLanguage(lang, loadData = true) {
        if (lang !== 'en' && lang !== 'id') {
            console.error('Invalid language code:', lang);
            return;
        }
        console.log('[LanguageManager] setLanguage called. Current:', this.currentLang, 'New:', lang, 'loadData:', loadData);
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        // Update UI to show active language
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');
        if (document.getElementById(`lang-${lang}-desktop`)) {
            document.querySelectorAll('[id$="-desktop"]').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`lang-${lang}-desktop`).classList.add('active');
        }
        // Update static UI text
        this.updateUIText();
        // Load penal code data if requested
        if (loadData && window.appManager) {
            console.log('[LanguageManager] Calling appManager.loadPenalCodeData()');
            window.appManager.loadPenalCodeData();
        }
    },
    
    /**
     * Update UI text based on current language
     */
    updateUIText() {
        const texts = this.translations[this.currentLang];
        
        // Update all elements with data-lang-key attribute
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (texts[key]) {
                element.textContent = texts[key];
            }
        });
        // Sidebar index label (All Titles)
        const sidebarIndex = document.querySelector('#sidebar-menu > .font-bold');
        if (sidebarIndex) {
            sidebarIndex.textContent = texts.allTitles;
        }
        
        // Update placeholder attributes
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-key-placeholder');
            if (texts[key]) {
                element.placeholder = texts[key];
            }
        });
        
        // Update document title
        document.title = texts.title;
    },
    
    /**
     * Get translation for a specific key
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    getText(key) {
        return this.translations[this.currentLang][key] || key;
    }
};

// Inisialisasi languageManager hanya setelah DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        languageManager.init();
    });
} else {
    languageManager.init();
}
/**
 * Language Manager for Desktop Application
 * Handles language switching and text localization with enhanced features
 */
const languageManager = {
    currentLang: 'en',
    supportedLanguages: ['en', 'id'],
    
    // Enhanced translations for UI elements
    translations: {
        en: {
            // Application
            title: 'Los Santos Penal Code - Desktop Application',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Information',
            
            // Navigation
            allTitles: 'All Titles',
            searchPlaceholder: 'Search penal code...',
            noResults: 'No Results Found',
            searchResults: 'Search Results',
            
            // Calculator
            calculator: 'Fine & Jail Calculator',
            selectArticles: 'Select Articles',
            selectedArticles: 'Selected Articles',
            calculationResults: 'Calculation Results',
            calculate: 'Calculate',
            clear: 'Clear',
            save: 'Save',
            export: 'Export',
            copy: 'Copy',
            totalFine: 'Total Fine',
            totalJailTime: 'Total Jail Time',
            breakdown: 'Breakdown',
            
            // Bookmarks
            bookmarks: 'Bookmarks',
            bookmark: 'Bookmark',
            addBookmark: 'Add Bookmark',
            removeBookmark: 'Remove Bookmark',
            manageBookmarks: 'Manage Bookmarks',
            noBookmarks: 'No bookmarks yet',
            bookmarkAdded: 'Bookmark added successfully',
            bookmarkRemoved: 'Bookmark removed successfully',
            
            // Theme
            darkMode: 'Dark Mode',
            lightMode: 'Light Mode',
            theme: 'Theme',
            
            // Actions
            print: 'Print',
            copyToClipboard: 'Copy to Clipboard',
            exportPDF: 'Export PDF',
            goToTop: 'Go to Top',
            refresh: 'Refresh',
            settings: 'Settings',
            help: 'Help',
            about: 'About',
            
            // Filters
            all: 'All',
            code: 'Code',
            titleFilter: 'Title',
            content: 'Content',
            
            // Messages
            loadingData: 'Loading penal code data...',
            dataLoaded: 'Data loaded successfully',
            errorLoading: 'Error loading data',
            noDataAvailable: 'No data available',
            offlineMode: 'Offline mode - using cached data',
            calculationSaved: 'Calculation saved successfully',
            calculationExported: 'Calculation exported successfully',
            articleCopied: 'Article copied to clipboard',
            linkCopied: 'Link copied to clipboard',
            exportSuccessful: 'Export completed successfully',
            
            // Keyboard shortcuts
            shortcuts: 'Keyboard Shortcuts',
            searchShortcut: 'Ctrl+F - Search',
            calculatorShortcut: 'Ctrl+K - Open Calculator',
            bookmarksShortcut: 'Ctrl+B - Manage Bookmarks',
            printShortcut: 'Ctrl+P - Print',
            exportShortcut: 'Ctrl+E - Export',
            refreshShortcut: 'F5 - Refresh',
            
            // Context menu
            copyArticle: 'Copy Article',
            bookmarkArticle: 'Bookmark Article',
            addToCalculator: 'Add to Calculator',
            exportArticle: 'Export Article',
            printArticle: 'Print Article',
            goToSection: 'Go to Section',
            copyLink: 'Copy Link',
            
            // Validation messages
            pleaseSelectArticles: 'Please select at least one article',
            invalidInput: 'Invalid input',
            calculationError: 'Error in calculation',
            exportError: 'Error during export',
            copyError: 'Error copying to clipboard',
            
            // Time units
            years: 'years',
            year: 'year',
            months: 'months',
            month: 'month',
            days: 'days',
            day: 'day',
            
            // Punishment terms
            punishment: 'Punishment',
            fine: 'Fine',
            imprisonment: 'Imprisonment',
            lifeImprisonment: 'Life Imprisonment',
            deathPenalty: 'Death Penalty',
            
            // Legal terms
            legalNotice: 'Legal Notice',
            disclaimer: 'This calculation is for informational purposes only',
            actualSentencing: 'Actual sentencing may vary based on circumstances',
            consultAttorney: 'Consult with a qualified attorney for legal advice'
        },
        
        id: {
            // Aplikasi
            title: 'KUHP Los Santos - Aplikasi Desktop',
            loading: 'Memuat...',
            error: 'Kesalahan',
            success: 'Berhasil',
            warning: 'Peringatan',
            info: 'Informasi',
            
            // Navigasi
            allTitles: 'Semua Judul',
            searchPlaceholder: 'Cari pasal KUHP...',
            noResults: 'Tidak Ada Hasil',
            searchResults: 'Hasil Pencarian',
            
            // Kalkulator
            calculator: 'Kalkulator Denda & Penjara',
            selectArticles: 'Pilih Pasal',
            selectedArticles: 'Pasal Terpilih',
            calculationResults: 'Hasil Perhitungan',
            calculate: 'Hitung',
            clear: 'Hapus',
            save: 'Simpan',
            export: 'Ekspor',
            copy: 'Salin',
            totalFine: 'Total Denda',
            totalJailTime: 'Total Waktu Penjara',
            breakdown: 'Rincian',
            
            // Penanda
            bookmarks: 'Penanda',
            bookmark: 'Penanda',
            addBookmark: 'Tambah Penanda',
            removeBookmark: 'Hapus Penanda',
            manageBookmarks: 'Kelola Penanda',
            noBookmarks: 'Belum ada penanda',
            bookmarkAdded: 'Penanda berhasil ditambahkan',
            bookmarkRemoved: 'Penanda berhasil dihapus',
            
            // Tema
            darkMode: 'Mode Gelap',
            lightMode: 'Mode Terang',
            theme: 'Tema',
            
            // Tindakan
            print: 'Cetak',
            copyToClipboard: 'Salin ke Clipboard',
            exportPDF: 'Ekspor PDF',
            goToTop: 'Ke Atas',
            refresh: 'Muat Ulang',
            settings: 'Pengaturan',
            help: 'Bantuan',
            about: 'Tentang',
            
            // Filter
            all: 'Semua',
            code: 'Kode',
            titleFilter: 'Judul',
            content: 'Konten',
            
            // Pesan
            loadingData: 'Memuat data KUHP...',
            dataLoaded: 'Data berhasil dimuat',
            errorLoading: 'Kesalahan memuat data',
            noDataAvailable: 'Tidak ada data tersedia',
            offlineMode: 'Mode offline - menggunakan data cache',
            calculationSaved: 'Perhitungan berhasil disimpan',
            calculationExported: 'Perhitungan berhasil diekspor',
            articleCopied: 'Pasal berhasil disalin',
            linkCopied: 'Tautan berhasil disalin',
            exportSuccessful: 'Ekspor berhasil diselesaikan',
            
            // Pintasan keyboard
            shortcuts: 'Pintasan Keyboard',
            searchShortcut: 'Ctrl+F - Pencarian',
            calculatorShortcut: 'Ctrl+K - Buka Kalkulator',
            bookmarksShortcut: 'Ctrl+B - Kelola Penanda',
            printShortcut: 'Ctrl+P - Cetak',
            exportShortcut: 'Ctrl+E - Ekspor',
            refreshShortcut: 'F5 - Muat Ulang',
            
            // Menu konteks
            copyArticle: 'Salin Pasal',
            bookmarkArticle: 'Tandai Pasal',
            addToCalculator: 'Tambah ke Kalkulator',
            exportArticle: 'Ekspor Pasal',
            printArticle: 'Cetak Pasal',
            goToSection: 'Ke Bagian',
            copyLink: 'Salin Tautan',
            
            // Pesan validasi
            pleaseSelectArticles: 'Silakan pilih setidaknya satu pasal',
            invalidInput: 'Input tidak valid',
            calculationError: 'Kesalahan dalam perhitungan',
            exportError: 'Kesalahan saat ekspor',
            copyError: 'Kesalahan saat menyalin ke clipboard',
            
            // Satuan waktu
            years: 'tahun',
            year: 'tahun',
            months: 'bulan',
            month: 'bulan',
            days: 'hari',
            day: 'hari',
            
            // Istilah hukuman
            punishment: 'Hukuman',
            fine: 'Denda',
            imprisonment: 'Penjara',
            lifeImprisonment: 'Penjara Seumur Hidup',
            deathPenalty: 'Hukuman Mati',
            
            // Istilah hukum
            legalNotice: 'Pemberitahuan Hukum',
            disclaimer: 'Perhitungan ini hanya untuk tujuan informasi',
            actualSentencing: 'Putusan sebenarnya dapat bervariasi berdasarkan keadaan',
            consultAttorney: 'Konsultasikan dengan pengacara yang berkualitas untuk nasihat hukum'
        }
    },
    
    /**
     * Initialize language manager with enhanced features
     */
    init() {
        // Check localStorage for saved language preference
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLang = savedLang;
        } else {
            // Detect system language
            const systemLang = navigator.language.substring(0, 2);
            if (this.supportedLanguages.includes(systemLang)) {
                this.currentLang = systemLang;
            }
        }
        
        // Set initial language
        this.setLanguage(this.currentLang, false);
        
        // Add event listeners to language buttons
        this.setupLanguageButtons();
        
        // Setup global language change detection
        this.setupLanguageChangeDetection();
        
        // Make languageManager global for debugging and external access
        window.languageManager = this;
        window.currentLang = this.currentLang;
        
        console.log('Enhanced Language manager initialized with language:', this.currentLang);
    },
    
    /**
     * Setup language buttons with enhanced functionality
     */
    setupLanguageButtons() {
        // Desktop language buttons
        const buttons = [
            { id: 'lang-en', lang: 'en' },
            { id: 'lang-id', lang: 'id' },
            { id: 'lang-en-desktop', lang: 'en' },
            { id: 'lang-id-desktop', lang: 'id' }
        ];
        
        buttons.forEach(({ id, lang }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.setLanguage(lang));
                console.log(`[LanguageManager] ${id} button found and event attached`);
            }
        });
        
        // Update initial button states
        this.updateLanguageButtons();
    },
    
    /**
     * Setup language change detection
     */
    setupLanguageChangeDetection() {
        // Listen for system language changes
        window.addEventListener('languagechange', () => {
            console.log('System language changed, updating application language');
            const systemLang = navigator.language.substring(0, 2);
            if (this.supportedLanguages.includes(systemLang) && 
                !localStorage.getItem('preferredLanguage')) {
                this.setLanguage(systemLang);
            }
        });
        
        // Custom event for language changes
        window.addEventListener('app:languageChanged', (e) => {
            console.log('Language changed via custom event:', e.detail);
            this.setLanguage(e.detail.language);
        });
    },
    
    /**
     * Set the application language with enhanced features
     * @param {string} lang - Language code ('en' or 'id')
     * @param {boolean} loadData - Whether to load new data (default: true)
     */
    setLanguage(lang, loadData = true) {
        if (!this.supportedLanguages.includes(lang)) {
            console.error('Invalid language code:', lang);
            return false;
        }
        
        const previousLang = this.currentLang;
        console.log('[LanguageManager] setLanguage called. Previous:', previousLang, 'New:', lang, 'loadData:', loadData);
        
        this.currentLang = lang;
        window.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // Update UI to show active language
        this.updateLanguageButtons();
        
        // Update static UI text
        this.updateUIText();
        
        // Update document attributes
        document.documentElement.lang = lang;
        
        // Load penal code data if requested
        if (loadData && window.appManager) {
            console.log('[LanguageManager] Calling appManager.loadPenalCodeData()');
            window.appManager.loadPenalCodeData();
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { 
                previousLanguage: previousLang, 
                newLanguage: lang,
                translations: this.translations[lang]
            }
        }));
        
        // Show success notification
        const message = this.getText('dataLoaded');
        if (window.appManager && typeof window.appManager.showNotification === 'function') {
            window.appManager.showNotification(message, 'success');
        }
        
        return true;
    },
    
    /**
     * Update language button states
     */
    updateLanguageButtons() {
        // Remove active class from all language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to current language buttons
        document.querySelectorAll(`#lang-${this.currentLang}, #lang-${this.currentLang}-desktop`).forEach(btn => {
            btn.classList.add('active');
        });
    },
    
    /**
     * Update UI text based on current language with enhanced features
     */
    updateUIText() {
        const texts = this.translations[this.currentLang];
        if (!texts) {
            console.warn('No translations found for language:', this.currentLang);
            return;
        }
        
        // Update all elements with data-lang-key attribute
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (texts[key]) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = texts[key];
                } else {
                    element.textContent = texts[key];
                }
            }
        });
        
        // Update placeholder attributes
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-key-placeholder');
            if (texts[key]) {
                element.placeholder = texts[key];
            }
        });
        
        // Update title attributes (tooltips)
        document.querySelectorAll('[data-lang-key-title]').forEach(element => {
            const key = element.getAttribute('data-lang-key-title');
            if (texts[key]) {
                element.title = texts[key];
            }
        });
        
        // Update specific UI elements
        this.updateSpecificElements(texts);
        
        // Update document title
        document.title = texts.title;
        
        // Update meta description if available
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && texts.description) {
            metaDescription.content = texts.description;
        }
    },
    
    /**
     * Update specific UI elements that require special handling
     */
    updateSpecificElements(texts) {
        // Sidebar index label (All Titles)
        const sidebarIndex = document.querySelector('#sidebar-menu > .font-bold');
        if (sidebarIndex) {
            sidebarIndex.textContent = texts.allTitles;
        }
        
        // Search input placeholder
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = texts.searchPlaceholder;
        }
        
        // Quick action buttons
        const quickCalc = document.getElementById('quick-calculator');
        if (quickCalc) {
            const text = quickCalc.querySelector('span') || quickCalc;
            text.textContent = texts.calculator;
        }
        
        const quickBookmarks = document.getElementById('quick-bookmarks');
        if (quickBookmarks) {
            const text = quickBookmarks.querySelector('span') || quickBookmarks;
            text.textContent = texts.bookmarks;
        }
        
        // No results message
        const noResults = document.getElementById('no-results');
        if (noResults) {
            const heading = noResults.querySelector('h3');
            const description = noResults.querySelector('p');
            if (heading) heading.textContent = texts.noResults;
            if (description) description.textContent = 'Try adjusting your search terms or filters.';
        }
        
        // Theme toggle label
        const themeLabel = document.querySelector('[for="theme-switch"]');
        if (themeLabel) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            themeLabel.textContent = currentTheme === 'dark' ? texts.darkMode : texts.lightMode;
        }
        
        // Filter labels
        const filterLabels = document.querySelectorAll('.filter-option span');
        const filterKeys = ['all', 'code', 'titleFilter', 'content'];
        filterLabels.forEach((label, index) => {
            if (filterKeys[index] && texts[filterKeys[index]]) {
                label.textContent = texts[filterKeys[index]];
            }
        });
    },
    
    /**
     * Get translation for a specific key with fallback support
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for string interpolation
     * @returns {string} Translated text
     */
    getText(key, params = {}) {
        const texts = this.translations[this.currentLang];
        let text = texts && texts[key] ? texts[key] : key;
        
        // String interpolation
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(paramKey => {
                const placeholder = new RegExp(`{{${paramKey}}}`, 'g');
                text = text.replace(placeholder, params[paramKey]);
            });
        }
        
        return text;
    },
    
    /**
     * Get translations for multiple keys
     * @param {Array} keys - Array of translation keys
     * @returns {Object} Object with key-value pairs of translations
     */
    getTexts(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.getText(key);
        });
        return result;
    },
    
    /**
     * Add or update translations dynamically
     * @param {string} lang - Language code
     * @param {Object} newTranslations - New translation key-value pairs
     */
    addTranslations(lang, newTranslations) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn('Language not supported:', lang);
            return;
        }
        
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        
        Object.assign(this.translations[lang], newTranslations);
        
        // Update UI if current language
        if (lang === this.currentLang) {
            this.updateUIText();
        }
        
        console.log('Added translations for', lang, ':', newTranslations);
    },
    
    /**
     * Get supported languages
     * @returns {Array} Array of supported language codes
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    },
    
    /**
     * Get current language information
     * @returns {Object} Current language information
     */
    getCurrentLanguageInfo() {
        return {
            code: this.currentLang,
            name: this.currentLang === 'en' ? 'English' : 'Bahasa Indonesia',
            nativeName: this.currentLang === 'en' ? 'English' : 'Bahasa Indonesia',
            direction: 'ltr',
            translations: this.translations[this.currentLang]
        };
    },
    
    /**
     * Format number according to current language locale
     * @param {number} number - Number to format
     * @param {Object} options - Intl.NumberFormat options
     * @returns {string} Formatted number
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLang === 'id' ? 'id-ID' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    },
    
    /**
     * Format currency according to current language locale
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, currency = 'USD') {
        const locale = this.currentLang === 'id' ? 'id-ID' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    /**
     * Format date according to current language locale
     * @param {Date} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const locale = this.currentLang === 'id' ? 'id-ID' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    },
    
    /**
     * Get relative time format (e.g., "2 hours ago")
     * @param {Date} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        const texts = this.translations[this.currentLang];
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date, { dateStyle: 'medium' });
    },
    
    /**
     * Switch to next available language
     */
    switchToNextLanguage() {
        const currentIndex = this.supportedLanguages.indexOf(this.currentLang);
        const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
        const nextLang = this.supportedLanguages[nextIndex];
        this.setLanguage(nextLang);
    },
    
    /**
     * Reset language to system default
     */
    resetToSystemLanguage() {
        localStorage.removeItem('preferredLanguage');
        const systemLang = navigator.language.substring(0, 2);
        const targetLang = this.supportedLanguages.includes(systemLang) ? systemLang : 'en';
        this.setLanguage(targetLang);
    }
};

// Initialize language manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        languageManager.init();
    });
} else {
    languageManager.init();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageManager;
}

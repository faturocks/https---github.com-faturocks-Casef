/**
 * Enhanced Theme Manager for Desktop Application
 * Handles theme switching with advanced features and system integration
 */
const themeManager = {
    // Available themes
    themes: {
        dark: {
            name: 'Dark',
            cssVariables: {
                '--bg-primary': '#121212',
                '--bg-secondary': '#1e1e1e',
                '--text-primary': '#e0e0e0',
                '--text-secondary': '#a0a0a0',
                '--accent-color': '#38bdf8',
                '--border-color': '#333333',
                '--card-bg': '#1e1e1e',
                '--card-shadow': '0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)',
                '--highlight-color': '#facc15'
            }
        },
        light: {
            name: 'Light',
            cssVariables: {
                '--bg-primary': '#d1d5db',
                '--bg-secondary': '#9ca3af',
                '--text-primary': '#23272f',
                '--text-secondary': '#374151',
                '--accent-color': '#0d6efd',
                '--border-color': '#6b7280',
                '--card-bg': '#9ca3af',
                '--card-shadow': '0 0.125rem 0.25rem rgba(0, 0, 0, 0.10)',
                '--highlight-color': '#ffc107'
            }
        },
        auto: {
            name: 'Auto',
            followsSystem: true
        }
    },
    
    currentTheme: 'dark',
    systemTheme: 'dark',
    
    /**
     * Initialize theme manager with enhanced features
     */
    init() {
        // Get DOM elements
        this.themeSwitch = document.getElementById('theme-switch');
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.darkIcon = document.getElementById('dark-icon');
        this.lightIcon = document.getElementById('light-icon');
        this.themeLabel = document.getElementById('theme-label');
        
        // Detect system theme preference
        this.detectSystemTheme();
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Determine initial theme
        let initialTheme = 'dark'; // Default to dark
        
        if (savedTheme && this.themes[savedTheme]) {
            initialTheme = savedTheme;
        } else if (savedTheme === 'auto') {
            initialTheme = 'auto';
        } else if (!savedTheme) {
            // No saved preference, check system
            initialTheme = prefersDarkScheme.matches ? 'dark' : 'light';
        }
        
        // Set initial theme
        this.setTheme(initialTheme);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup system theme monitoring
        this.setupSystemThemeMonitoring();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Make globally available
        window.themeManager = this;
        
        console.log('Enhanced Theme manager initialized with theme:', this.currentTheme);
    },
    
    /**
     * Detect system theme
     */
    detectSystemTheme() {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
    },
    
    /**
     * Setup event listeners with enhanced functionality
     */
    setupEventListeners() {
        // Theme switch toggle
        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('change', () => {
                const theme = this.themeSwitch.checked ? 'dark' : 'light';
                this.setTheme(theme);
            });
        }
        
        // Theme toggle button
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Double-click for auto theme
        if (this.themeToggleBtn) {
            let clickCount = 0;
            this.themeToggleBtn.addEventListener('click', () => {
                clickCount++;
                setTimeout(() => {
                    if (clickCount === 2) {
                        this.setTheme('auto');
                    }
                    clickCount = 0;
                }, 300);
            });
        }
        
        // Custom theme change events
        window.addEventListener('themeChangeRequest', (e) => {
            this.setTheme(e.detail.theme);
        });
    },
    
    /**
     * Setup system theme monitoring
     */
    setupSystemThemeMonitoring() {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        prefersDarkScheme.addEventListener('change', (e) => {
            this.systemTheme = e.matches ? 'dark' : 'light';
            console.log('System theme changed to:', this.systemTheme);
            
            // If current theme is auto, update accordingly
            if (this.currentTheme === 'auto') {
                this.applyTheme(this.systemTheme);
            }
            
            // If no saved preference, follow system
            if (!localStorage.getItem('theme')) {
                this.setTheme(this.systemTheme);
            }
        });
    },
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + T to toggle theme
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Alt + Shift + T for auto theme
            if (e.altKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.setTheme('auto');
            }
        });
    },
    
    /**
     * Set the application theme with enhanced features
     * @param {string} theme - Theme name ('light', 'dark', or 'auto')
     */
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.error('Invalid theme:', theme);
            return;
        }
        
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // Determine actual theme to apply
        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = this.systemTheme;
        }
        
        // Apply the theme
        this.applyTheme(actualTheme);
        
        // Update UI controls
        this.updateThemeControls(theme, actualTheme);
        
        // Save preference
        localStorage.setItem('theme', theme);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { 
                previousTheme, 
                newTheme: theme, 
                actualTheme,
                themeData: this.themes[actualTheme]
            }
        }));
        
        // Show notification
        this.showThemeChangeNotification(theme, actualTheme);
        
        console.log(`Theme changed from ${previousTheme} to ${theme} (applying ${actualTheme})`);
    },
    
    /**
     * Apply theme to the document
     * @param {string} theme - Theme to apply ('light' or 'dark')
     */
    applyTheme(theme) {
        if (!this.themes[theme] || this.themes[theme].followsSystem) {
            return;
        }
        
        const themeData = this.themes[theme];
        
        // Apply CSS variables
        if (themeData.cssVariables) {
            Object.entries(themeData.cssVariables).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
        }
        
        // Set data-theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Add smooth transition class
        document.documentElement.classList.add('theme-transition');
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 500);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Apply platform-specific adjustments
        this.applyPlatformAdjustments(theme);
    },
    
    /**
     * Update theme controls UI
     * @param {string} theme - Selected theme
     * @param {string} actualTheme - Actually applied theme
     */
    updateThemeControls(theme, actualTheme) {
        // Update theme switch
        if (this.themeSwitch) {
            this.themeSwitch.checked = actualTheme === 'dark';
        }
        
        // Update theme label
        if (this.themeLabel) {
            const langKey = actualTheme === 'dark' ? 'darkMode' : 'lightMode';
            let labelText = actualTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
            
            // Add auto indicator
            if (theme === 'auto') {
                labelText += ' (Auto)';
            }
            
            // Try to get localized text
            if (window.languageManager && window.languageManager.getText) {
                const localizedText = window.languageManager.getText(langKey);
                if (localizedText !== langKey) {
                    labelText = localizedText;
                    if (theme === 'auto') {
                        labelText += ' (Auto)';
                    }
                }
            }
            
            this.themeLabel.textContent = labelText;
        }
        
        // Update toggle button icons
        if (this.darkIcon && this.lightIcon) {
            if (actualTheme === 'dark') {
                this.darkIcon.classList.remove('hidden');
                this.lightIcon.classList.add('hidden');
            } else {
                this.darkIcon.classList.add('hidden');
                this.lightIcon.classList.remove('hidden');
            }
        }
        
        // Update button title with current mode info
        if (this.themeToggleBtn) {
            let title = `Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`;
            if (theme === 'auto') {
                title += ' (Currently auto)';
            }
            this.themeToggleBtn.title = title;
        }
    },
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        if (this.currentTheme === 'auto') {
            // From auto, go to opposite of current system theme
            const newTheme = this.systemTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        } else {
            // Normal toggle
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        }
    },
    
    /**
     * Update meta theme-color for mobile browsers
     * @param {string} theme - Theme name
     */
    updateMetaThemeColor(theme) {
        let themeColor = '#121212'; // Dark theme color
        if (theme === 'light') {
            themeColor = '#d1d5db'; // Light theme color
        }
        
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;
    },
    
    /**
     * Apply platform-specific theme adjustments
     * @param {string} theme - Theme name
     */
    applyPlatformAdjustments(theme) {
        // Electron-specific adjustments
        if (window.platform && window.platform.isElectron) {
            // Update window background color
            document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#d1d5db';
            
            // Notify main process about theme change
            if (window.electronAPI && window.electronAPI.setTheme) {
                window.electronAPI.setTheme(theme);
            }
        }
        
        // Web-specific adjustments
        if (!window.platform || !window.platform.isElectron) {
            // Update CSS custom properties for better web compatibility
            this.updateWebCompatibility(theme);
        }
    },
    
    /**
     * Update web compatibility styles
     * @param {string} theme - Theme name
     */
    updateWebCompatibility(theme) {
        // Add theme-specific classes to body
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${theme}`);
        
        // Update selection colors
        const selectionColor = theme === 'dark' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(13, 110, 253, 0.3)';
        const selectionStyle = document.getElementById('selection-style') || document.createElement('style');
        selectionStyle.id = 'selection-style';
        selectionStyle.textContent = `
            ::selection {
                background-color: ${selectionColor};
            }
            ::-moz-selection {
                background-color: ${selectionColor};
            }
        `;
        
        if (!selectionStyle.parentNode) {
            document.head.appendChild(selectionStyle);
        }
    },
    
    /**
     * Show theme change notification
     * @param {string} theme - Selected theme
     * @param {string} actualTheme - Actually applied theme
     */
    showThemeChangeNotification(theme, actualTheme) {
        if (window.appManager && typeof window.appManager.showNotification === 'function') {
            let message = `Switched to ${actualTheme} mode`;
            if (theme === 'auto') {
                message += ' (Auto)';
            }
            window.appManager.showNotification(message, 'info');
        }
    },
    
    /**
     * Get current theme information
     * @returns {Object} Current theme information
     */
    getCurrentThemeInfo() {
        const actualTheme = this.currentTheme === 'auto' ? this.systemTheme : this.currentTheme;
        
        return {
            selectedTheme: this.currentTheme,
            appliedTheme: actualTheme,
            systemTheme: this.systemTheme,
            isAuto: this.currentTheme === 'auto',
            themeData: this.themes[actualTheme]
        };
    },
    
    /**
     * Get available themes
     * @returns {Object} Available themes
     */
    getAvailableThemes() {
        return { ...this.themes };
    },
    
    /**
     * Add custom theme
     * @param {string} name - Theme name
     * @param {Object} themeData - Theme configuration
     */
    addCustomTheme(name, themeData) {
        if (this.themes[name]) {
            console.warn('Theme already exists:', name);
            return false;
        }
        
        this.themes[name] = themeData;
        console.log('Custom theme added:', name);
        return true;
    },
    
    /**
     * Remove custom theme
     * @param {string} name - Theme name
     */
    removeCustomTheme(name) {
        if (['dark', 'light', 'auto'].includes(name)) {
            console.error('Cannot remove built-in theme:', name);
            return false;
        }
        
        if (!this.themes[name]) {
            console.warn('Theme does not exist:', name);
            return false;
        }
        
        delete this.themes[name];
        
        // If current theme was removed, fallback to dark
        if (this.currentTheme === name) {
            this.setTheme('dark');
        }
        
        console.log('Custom theme removed:', name);
        return true;
    },
    
    /**
     * Reset theme to system default
     */
    resetToSystemDefault() {
        localStorage.removeItem('theme');
        this.setTheme('auto');
    },
    
    /**
     * Export current theme settings
     * @returns {Object} Theme settings
     */
    exportThemeSettings() {
        return {
            currentTheme: this.currentTheme,
            systemTheme: this.systemTheme,
            customThemes: Object.fromEntries(
                Object.entries(this.themes).filter(([name]) => 
                    !['dark', 'light', 'auto'].includes(name)
                )
            )
        };
    },
    
    /**
     * Import theme settings
     * @param {Object} settings - Theme settings to import
     */
    importThemeSettings(settings) {
        try {
            // Import custom themes
            if (settings.customThemes) {
                Object.entries(settings.customThemes).forEach(([name, themeData]) => {
                    this.addCustomTheme(name, themeData);
                });
            }
            
            // Set theme if valid
            if (settings.currentTheme && this.themes[settings.currentTheme]) {
                this.setTheme(settings.currentTheme);
            }
            
            console.log('Theme settings imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import theme settings:', error);
            return false;
        }
    },
    
    /**
     * Schedule theme change (for time-based themes)
     * @param {string} theme - Theme to switch to
     * @param {Date} scheduledTime - When to switch
     */
    scheduleThemeChange(theme, scheduledTime) {
        const now = new Date();
        const delay = scheduledTime.getTime() - now.getTime();
        
        if (delay <= 0) {
            console.warn('Scheduled time is in the past');
            return;
        }
        
        setTimeout(() => {
            this.setTheme(theme);
            console.log('Scheduled theme change executed:', theme);
        }, delay);
        
        console.log(`Theme change scheduled for ${scheduledTime.toLocaleString()}`);
    },
    
    /**
     * Apply high contrast mode adjustments
     * @param {boolean} enable - Whether to enable high contrast
     */
    setHighContrast(enable) {
        if (enable) {
            document.documentElement.classList.add('high-contrast');
            // Override some CSS variables for better contrast
            document.documentElement.style.setProperty('--accent-color', '#0066cc');
            document.documentElement.style.setProperty('--highlight-color', '#ffff00');
        } else {
            document.documentElement.classList.remove('high-contrast');
            // Restore original theme
            this.applyTheme(this.currentTheme === 'auto' ? this.systemTheme : this.currentTheme);
        }
        
        localStorage.setItem('highContrast', enable.toString());
    },
    
    /**
     * Check if high contrast mode is supported and enabled
     * @returns {boolean} Whether high contrast is enabled
     */
    isHighContrastEnabled() {
        return document.documentElement.classList.contains('high-contrast');
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});

// Handle system theme changes even before DOM is ready
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
prefersDarkScheme.addEventListener('change', (e) => {
    // Apply immediate theme change if no theme manager is initialized yet
    if (!window.themeManager) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeManager;
}

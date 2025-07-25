/**
 * Theme Manager
 * Handles theme switching between light and dark modes
 */
const themeManager = {
    /**
     * Initialize theme manager
     */
    init() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.darkIcon = document.getElementById('dark-icon');
        this.lightIcon = document.getElementById('light-icon');
        this.themeLabel = document.getElementById('theme-label');
        
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Set initial theme
        if (savedTheme === 'light') {
            this.setTheme('light');
            if (this.themeSwitch) this.themeSwitch.checked = false;
        } else if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            this.setTheme('dark');
            if (this.themeSwitch) this.themeSwitch.checked = true;
        } else {
            this.setTheme('dark'); // Default to dark theme
            if (this.themeSwitch) this.themeSwitch.checked = true;
        }
        
        // Add event listeners
        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('change', () => {
                const theme = this.themeSwitch.checked ? 'dark' : 'light';
                this.setTheme(theme);
            });
        }
        
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
                if (this.themeSwitch) this.themeSwitch.checked = newTheme === 'dark';
            });
        }
        
        // Listen for system preference changes
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const theme = e.matches ? 'dark' : 'light';
                this.setTheme(theme);
                if (this.themeSwitch) this.themeSwitch.checked = theme === 'dark';
            }
        });
        
        console.log('Theme manager initialized with theme:', document.documentElement.getAttribute('data-theme'));
    },
    
    /**
     * Set the application theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('Invalid theme:', theme);
            return;
        }
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update UI
        if (this.themeLabel) {
            const langKey = theme === 'dark' ? 'darkMode' : 'lightMode';
            if (typeof labels !== 'undefined' && labels[currentLang] && labels[currentLang][langKey]) {
                this.themeLabel.textContent = labels[currentLang][langKey];
            } else {
                this.themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
            }
        }
        
        // Update toggle button icons
        if (this.darkIcon && this.lightIcon) {
            if (theme === 'dark') {
                this.darkIcon.classList.remove('hidden');
                this.lightIcon.classList.add('hidden');
            } else {
                this.darkIcon.classList.add('hidden');
                this.lightIcon.classList.remove('hidden');
            }
        }
        
        // Add transition class for smooth color changes
        document.documentElement.classList.add('theme-transition');
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 500);
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});
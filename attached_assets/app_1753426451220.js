/**
 * Application Manager
 * Main application controller that initializes and coordinates all components
 */
const appManager = {
    /**
     * Initialize application
     */
    init() {
        // Store references to DOM elements
        this.preloader = document.getElementById('preloader');
        this.contentContainer = document.getElementById('penal-code-content');
        
        // Initialize core components
        this.initializeCore();
        
        // Load penal code data
        this.loadPenalCodeData();
        
        // Register service worker for offline support
        this.registerServiceWorker();
        
        console.log('Application initialized');
    },
    
    /**
     * Initialize core components
     */
    initializeCore() {
        // Make appManager globally available for other components
        window.appManager = this;
        
        // Initialize non-critical components after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hidePreloader();
            }, 500);
        });
    },
    
    /**
     * Hide preloader
     */
    hidePreloader() {
        if (this.preloader) {
            this.preloader.classList.add('hidden');
            setTimeout(() => {
                this.preloader.style.display = 'none';
            }, 500);
        }
    },
    
    /**
     * Load penal code data based on current language
     */
    loadPenalCodeData() {
        // Show loading state
        this.showLoadingState();
        
        // Use global currentLang from window if available
        const lang = (typeof window !== 'undefined' && window.currentLang) ? window.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'en');
        const dataUrl = `data/penal-code-${lang}.json`;
        console.log('[PenalCode] Fetching:', dataUrl);
        // Fetch data
        fetch(dataUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('[PenalCode] Data loaded:', data);
                this.renderContent(data);
                // Store original content for search reset
                if (window.searchManager) {
                    window.searchManager.setOriginalContent(this.contentContainer.innerHTML);
                }
                // Render table of contents
                if (window.tocManager) {
                    window.tocManager.renderTOC(data);
                }
                console.log(`Loaded penal code data for language: ${lang}`);
            })
            .catch(error => {
                console.error('Error loading penal code data:', error);
                this.showErrorState(error);
            });
    },
    
    /**
     * Show loading state in content container
     */
    showLoadingState() {
        this.contentContainer.innerHTML = `
            <div class="animate-pulse">
                <div class="h-8 bg-gray-800 rounded w-3/4 mb-6"></div>
                <div class="space-y-6">
                    <div class="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                        <div class="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div class="h-4 bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div class="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                        <div class="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div class="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div class="h-4 bg-gray-700 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Show error state in content container
     * @param {Error} error - Error object
     */
    showErrorState(error) {
        const lang = window.languageManager ? window.languageManager.currentLang : 'en';
const errorMessage = (typeof labels !== 'undefined' && labels[lang] && labels[lang].errorLoading) ? labels[lang].errorLoading : 'Error loading penal code data.';
            
        this.contentContainer.innerHTML = `
            <div class="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-4 text-xl font-semibold text-gray-400">${errorMessage}</h3>
                <p class="mt-2 text-gray-500">${error.message}</p>
                <button id="retry-load" class="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors">
                    Retry
                </button>
            </div>
        `;
        
        // Add retry button event listener
        document.getElementById('retry-load').addEventListener('click', () => {
            this.loadPenalCodeData();
        });
    },
    
    /**
     * Render penal code content
     * @param {Array} data - Penal code data
     */
    renderContent(data) {
        let html = '';
        data.forEach(title => {
            html += `<section id="${title.id}" class="scroll-mt-24 penal-code-title">`;
            // Prefer title, fallback to title_id, then title_en, else empty string
let sectionTitle = (title.title || title.title_id || title.title_en || '').toString().trim();
html += `<h2 class="text-2xl md:text-3xl font-bold text-white border-b-2 border-sky-500/50 pb-3 mb-6">${sectionTitle}</h2>`;
            html += `<div class="space-y-6">`;
            title.sections.forEach(section => {
                const codeStr = typeof section.code === 'string' ? section.code : '';
                const sectionId = `${title.id}-${codeStr.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()}`;
                // Gabungkan code dan name/title agar (F)/(M) selalu ada di data-subtitle
                // Subtitle: combine code/code_id/code_en and name/title/title_id/title_en, always trim and never show 'undefined'
let subtitleParts = [];
let codePart = section.code || section.code_id || section.code_en || '';
if (codePart) subtitleParts.push(codePart);
let namePart = section.name || section.title || section.title_id || section.title_en || '';
if (namePart) subtitleParts.push(namePart);
let subtitle = subtitleParts.join(' ').replace(/\s+/g, ' ').trim();
if (subtitle.startsWith('CHPC')) subtitle = subtitle.replace(/^CHPC\s*/, '');

                html += `<article id="${sectionId}" class="bg-gray-800/50 p-5 md:p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.01] hover:shadow-sky-500/10 penal-code-article" data-subtitle="${subtitle}">`;
                // Prefer code, fallback to code_id/code_en, else empty string
let sectionCode = section.code || section.code_id || section.code_en || '';
html += `<h3 class="text-lg font-semibold text-sky-400 mb-2">${sectionCode}</h3>`;

                // Support new definitions format (array)
                if (Array.isArray(section.definitions)) {
                    html += `<div class="definitions-container grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">`;
                    section.definitions.forEach(def => {
                        html += `
                            <div class="definition-item bg-gray-700/30 p-4 rounded-md hover:bg-gray-700/50 transition-colors">
                                <h4 class="text-sky-300 font-medium mb-1">${def.term}</h4>
                                <p class="text-gray-300 text-sm mb-1">${def.definition}</p>
                                <span class="text-xs text-gray-500">${def.citation || ''}</span>
                            </div>
                        `;
                    });
                    html += `</div>`;
                }
                // Fallback: old text-based or other section
                else if (section.text || section.text_id || section.text_en) {
    let sectionText = section.text || section.text_id || section.text_en || '';
    // Convert bullet points (•) and numbered lists (1., 2., etc.) to HTML lists
    let formatted = sectionText;
    // Bold phrases with **
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Render [cite: ...] as styled span at end of sentence or list item
    formatted = formatted.replace(/\[cite:([^\]]+)\]/g, '<span class="text-xs text-sky-300 ml-1">[$1]</span>');
    // If contains numbered or bullet list
    if (/^\s*\d+\./m.test(formatted) || /•/.test(formatted)) {
        // Handle bullet points
        if (/•/.test(formatted)) {
            formatted = formatted.replace(/\n?•\s*/g, '\n• ');
            let items = formatted.split(/\n• /).filter(x => x.trim() !== '');
            if (items.length > 1) {
                formatted = '<ul class="list-disc ml-6">' + items.map(i => `<li>${i.replace(/^•\s*/, '')}</li>`).join('') + '</ul>';
            }
        }
        // Handle numbered lists
        else if (/^\s*\d+\./m.test(formatted)) {
            let items = formatted.split(/\n(?=\d+\.)/).filter(x => x.trim() !== '');
            if (items.length > 1) {
                formatted = '<ol class="list-decimal ml-6">' + items.map(i => `<li>${i.trim()}</li>`).join('') + '</ol>';
            }
        }
    } else {
        // fallback: just newlines to <br>
        formatted = formatted.replace(/\n/g, '<br>');
    }
    html += `<div class="text-gray-300 leading-relaxed">${formatted}</div>`;
}
                if (section.punishment || section.fine) {
                    html += `<div class="mt-4 pt-4 border-t border-gray-700/50 space-y-1 text-gray-400">`;
                    if (section.punishment) {
                        html += `<p>Punishment: <span class="punishment-value">${section.punishment}</span></p>`;
                    }
                    if (section.fine) {
                        html += `<p>Fine: <span class="punishment-value">${section.fine}</span></p>`;
                    }
                    html += `</div>`;
                }
                html += `</article>`;
            });
            html += `</div></section>`;
        });
        this.contentContainer.innerHTML = html;
    },
    
    /**
     * Register service worker for offline support
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                        console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    appManager.init();
});
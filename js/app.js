/**
 * Enhanced Application Manager for Desktop
 * Main application controller with desktop-specific features
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
        
        // Setup desktop-specific features
        this.setupDesktopFeatures();
        
        console.log('Enhanced Desktop Application initialized');
    },
    
    /**
     * Initialize core components
     */
    initializeCore() {
        // Make appManager globally available for other components
        window.appManager = this;
        
        // Setup error handling
        this.setupErrorHandling();
        
        // Initialize non-critical components after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hidePreloader();
                this.initializeAdditionalFeatures();
            }, 500);
        });
    },
    
    /**
     * Setup desktop-specific features
     */
    setupDesktopFeatures() {
        // Check if running in Electron
        if (window.platform && window.platform.isElectron) {
            this.setupElectronFeatures();
        }
        
        // Setup context menus
        this.setupContextMenus();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Setup window management
        this.setupWindowManagement();
    },
    
    /**
     * Setup Electron-specific features
     */
    setupElectronFeatures() {
        console.log('Setting up Electron features');
        
        // Handle window controls if custom titlebar is used
        this.setupWindowControls();
        
        // Setup menu integration
        this.setupMenuIntegration();
        
        // Setup auto-updater if available
        this.setupAutoUpdater();
        
        // Handle app-specific protocols
        this.setupProtocolHandlers();
    },
    
    /**
     * Setup window controls
     */
    setupWindowControls() {
        // Add window controls if needed
        const windowControls = document.createElement('div');
        windowControls.className = 'window-controls';
        windowControls.innerHTML = `
            <button class="window-control-btn minimize" title="Minimize">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <rect width="10" height="1" x="1" y="6"/>
                </svg>
            </button>
            <button class="window-control-btn maximize" title="Maximize">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"/>
                </svg>
            </button>
            <button class="window-control-btn close" title="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <polygon points="11,1.5 10.5,1 6,5.5 1.5,1 1,1.5 5.5,6 1,10.5 1.5,11 6,6.5 10.5,11 11,10.5 6.5,6"/>
                </svg>
            </button>
        `;
        
        // Add event listeners for window controls
        const minimizeBtn = windowControls.querySelector('.minimize');
        const maximizeBtn = windowControls.querySelector('.maximize');
        const closeBtn = windowControls.querySelector('.close');
        
        if (window.electronAPI) {
            minimizeBtn?.addEventListener('click', () => window.electronAPI.minimizeWindow());
            maximizeBtn?.addEventListener('click', () => window.electronAPI.maximizeWindow());
            closeBtn?.addEventListener('click', () => window.electronAPI.closeWindow());
        }
        
        // Don't add to DOM unless custom titlebar is needed
        // document.body.appendChild(windowControls);
    },
    
    /**
     * Setup menu integration
     */
    setupMenuIntegration() {
        if (window.electronAPI) {
            // Handle menu events from main process
            window.electronAPI.onNewCalculator(() => {
                if (window.penalCodeCalculator) {
                    window.penalCodeCalculator.showCalculator();
                }
            });
            
            window.electronAPI.onExportPDF(() => {
                this.exportCurrentView();
            });
            
            window.electronAPI.onOpenCalculator(() => {
                if (window.penalCodeCalculator) {
                    window.penalCodeCalculator.showCalculator();
                }
            });
            
            window.electronAPI.onClearCalculator(() => {
                if (window.penalCodeCalculator) {
                    window.penalCodeCalculator.clearSelection();
                }
            });
            
            window.electronAPI.onCopyResults(() => {
                if (window.penalCodeCalculator && window.penalCodeCalculator.currentCalculation) {
                    window.penalCodeCalculator.copyResults();
                }
            });
            
            window.electronAPI.onManageBookmarks(() => {
                if (window.bookmarksManager) {
                    window.bookmarksManager.showBookmarks();
                }
            });
        }
    },
    
    /**
     * Setup context menus
     */
    setupContextMenus() {
        // Article context menu
        document.addEventListener('contextmenu', (e) => {
            const article = e.target.closest('.penal-code-article');
            if (article) {
                e.preventDefault();
                this.showArticleContextMenu(e, article);
            }
        });
        
        // Close context menus on click
        document.addEventListener('click', () => {
            this.hideContextMenus();
        });
    },
    
    /**
     * Show article context menu
     */
    showArticleContextMenu(e, article) {
        this.hideContextMenus();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="copy-article">Copy Article</div>
            <div class="context-menu-item" data-action="bookmark-article">Bookmark Article</div>
            <div class="context-menu-item" data-action="add-to-calculator">Add to Calculator</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="export-article">Export Article</div>
            <div class="context-menu-item" data-action="print-article">Print Article</div>
        `;
        
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        document.body.appendChild(menu);
        
        // Add click handlers
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleArticleContextAction(action, article);
            this.hideContextMenus();
        });
        
        this.currentContextMenu = menu;
    },
    
    /**
     * Handle article context menu actions
     */
    async handleArticleContextAction(action, article) {
        const articleData = this.extractArticleData(article);
        
        switch (action) {
            case 'copy-article':
                if (window.ClipboardUtil) {
                    const success = await window.ClipboardUtil.copyArticleContent(articleData);
                    this.showNotification(success ? 'Article copied!' : 'Copy failed', success ? 'success' : 'error');
                }
                break;
                
            case 'bookmark-article':
                if (window.bookmarksManager) {
                    await window.bookmarksManager.addBookmark(articleData.id, articleData.title);
                }
                break;
                
            case 'add-to-calculator':
                if (window.penalCodeCalculator) {
                    window.penalCodeCalculator.showCalculator();
                    // Note: Would need integration to pre-select the article
                }
                break;
                
            case 'export-article':
                await this.exportArticle(articleData);
                break;
                
            case 'print-article':
                this.printArticle(article);
                break;
        }
    },
    
    /**
     * Hide context menus
     */
    hideContextMenus() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    },
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if typing in input fields
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        document.getElementById('search-input')?.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        if (window.penalCodeCalculator) {
                            window.penalCodeCalculator.showCalculator();
                        }
                        break;
                    case 'r':
                        e.preventDefault();
                        this.loadPenalCodeData();
                        break;
                    case 's':
                        e.preventDefault();
                        // Save current state or export
                        this.exportCurrentView();
                        break;
                }
            }
            
            // Function keys
            switch (e.key) {
                case 'F5':
                    e.preventDefault();
                    this.loadPenalCodeData();
                    break;
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'Escape':
                    // Close any open modals or menus
                    this.closeModals();
                    break;
            }
        });
    },
    
    /**
     * Setup drag and drop
     */
    setupDragAndDrop() {
        // Prevent default drag behavior on the window
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            // Handle file drops if needed
        });
        
        // Setup drop zones for calculator
        this.setupCalculatorDropZone();
    },
    
    /**
     * Setup calculator drop zone
     */
    setupCalculatorDropZone() {
        // Create invisible drop zone that appears when dragging
        const dropZone = document.createElement('div');
        dropZone.id = 'calculator-drop-zone';
        dropZone.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center';
        dropZone.innerHTML = `
            <div class="bg-sky-600 text-white p-8 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                </svg>
                <h3 class="text-xl font-bold mb-2">Add to Calculator</h3>
                <p>Drop the section here to add it to the calculator</p>
            </div>
        `;
        
        document.body.appendChild(dropZone);
        
        // Show drop zone when dragging TOC items
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('toc-sublink')) {
                setTimeout(() => dropZone.classList.remove('hidden'), 100);
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('toc-sublink')) {
                dropZone.classList.add('hidden');
            }
        });
        
        // Handle drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const sectionData = JSON.parse(data);
                if (sectionData.type === 'penal-section') {
                    // Add to calculator
                    if (window.penalCodeCalculator) {
                        window.penalCodeCalculator.showCalculator();
                        // Note: Would need integration to add the specific section
                    }
                }
            }
            dropZone.classList.add('hidden');
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    },
    
    /**
     * Setup window management
     */
    setupWindowManagement() {
        // Handle window focus/blur
        window.addEventListener('focus', () => {
            console.log('Window focused');
            // Refresh data if needed
        });
        
        window.addEventListener('blur', () => {
            console.log('Window blurred');
            // Save state if needed
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // Handle window close
        window.addEventListener('beforeunload', (e) => {
            // Save application state
            this.saveApplicationState();
        });
    },
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Adjust layout if needed
        if (window.innerWidth < 768) {
            // Mobile layout adjustments
            document.getElementById('sidebar')?.classList.remove('open');
        }
        
        // Refresh floating buttons
        if (window.floatingButtons) {
            window.floatingButtons.refresh();
        }
    },
    
    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.showNotification('An error occurred: ' + e.error.message, 'error');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showNotification('An error occurred: ' + e.reason, 'error');
        });
    },
    
    /**
     * Initialize additional features after load
     */
    initializeAdditionalFeatures() {
        // Setup auto-save
        this.setupAutoSave();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Setup analytics if needed
        this.setupAnalytics();
    },
    
    /**
     * Load penal code data with enhanced error handling and caching
     */
    async loadPenalCodeData() {
        try {
            this.showLoadingState();
            
            const lang = window.languageManager ? window.languageManager.currentLang : 'en';
            let data;
            
            // Try loading from Electron database first
            if (window.electronAPI) {
                try {
                    console.log('[PenalCode] Loading from database:', lang);
                    data = await window.electronAPI.getArticles(lang);
                } catch (dbError) {
                    console.warn('[PenalCode] Database loading failed, falling back to JSON:', dbError);
                    // Fallback to JSON file
                    const dataUrl = `data/penal-code-${lang}.json`;
                    const response = await fetch(dataUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    data = await response.json();
                }
            } else {
                // Web mode - load from JSON
                const dataUrl = `data/penal-code-${lang}.json`;
                console.log('[PenalCode] Fetching:', dataUrl);
                const response = await fetch(dataUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                data = await response.json();
            }
            
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
            
            // Cache data for offline use
            this.cacheData(data, lang);
            
            console.log(`Loaded penal code data for language: ${lang}`);
            this.showNotification('Data loaded successfully', 'success');
            
        } catch (error) {
            console.error('Error loading penal code data:', error);
            this.showErrorState(error);
            
            // Try to load cached data
            this.loadCachedData();
        }
    },
    
    /**
     * Cache data for offline use
     */
    cacheData(data, lang) {
        try {
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(`penal-code-${lang}`, JSON.stringify(data));
                localStorage.setItem('penal-code-last-update', new Date().toISOString());
            }
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    },
    
    /**
     * Load cached data
     */
    loadCachedData() {
        try {
            const lang = window.languageManager ? window.languageManager.currentLang : 'en';
            const cached = localStorage.getItem(`penal-code-${lang}`);
            
            if (cached) {
                const data = JSON.parse(cached);
                this.renderContent(data);
                
                if (window.searchManager) {
                    window.searchManager.setOriginalContent(this.contentContainer.innerHTML);
                }
                
                if (window.tocManager) {
                    window.tocManager.renderTOC(data);
                }
                
                this.showNotification('Loaded cached data (offline mode)', 'info');
                return true;
            }
        } catch (error) {
            console.error('Failed to load cached data:', error);
        }
        return false;
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
     */
    showErrorState(error) {
        const lang = window.languageManager ? window.languageManager.currentLang : 'en';
        const errorMessage = 'Error loading penal code data.';
        
        this.contentContainer.innerHTML = `
            <div class="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-4 text-xl font-semibold text-gray-400">${errorMessage}</h3>
                <p class="mt-2 text-gray-500">${error.message}</p>
                <div class="mt-4 space-x-4">
                    <button id="retry-load" class="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors">
                        Retry
                    </button>
                    <button id="load-cached" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                        Load Cached Data
                    </button>
                </div>
            </div>
        `;
        
        // Add retry button event listeners
        document.getElementById('retry-load')?.addEventListener('click', () => {
            this.loadPenalCodeData();
        });
        
        document.getElementById('load-cached')?.addEventListener('click', () => {
            if (!this.loadCachedData()) {
                this.showNotification('No cached data available', 'error');
            }
        });
    },
    
    /**
     * Render penal code content with enhanced features
     */
    renderContent(data) {
        let html = '';
        data.forEach(title => {
            html += `<section id="${title.id}" class="scroll-mt-24 penal-code-title">`;
            
            let sectionTitle = (title.title || title.title_id || title.title_en || '').toString().trim();
            html += `<h2 class="text-2xl md:text-3xl font-bold text-white border-b-2 border-sky-500/50 pb-3 mb-6">${sectionTitle}</h2>`;
            html += `<div class="space-y-6">`;
            
            title.sections.forEach(section => {
                const codeStr = typeof section.code === 'string' ? section.code : '';
                const sectionId = `${title.id}-${codeStr.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()}`;
                
                // Build subtitle
                let subtitleParts = [];
                let codePart = section.code || section.code_id || section.code_en || '';
                if (codePart) subtitleParts.push(codePart);
                let namePart = section.name || section.title || section.title_id || section.title_en || '';
                if (namePart) subtitleParts.push(namePart);
                let subtitle = subtitleParts.join(' ').replace(/\s+/g, ' ').trim();
                if (subtitle.startsWith('CHPC')) subtitle = subtitle.replace(/^CHPC\s*/, '');
                
                html += `<article id="${sectionId}" class="bg-gray-800/50 p-5 md:p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-sky-500/10 penal-code-article" data-subtitle="${subtitle}">`;
                
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
                    let formatted = this.formatSectionText(sectionText);
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
        
        // Add enhanced interactions
        this.setupArticleInteractions();
    },
    
    /**
     * Format section text with enhanced features
     */
    formatSectionText(text) {
        let formatted = text;
        
        // Bold phrases with **
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Render [cite: ...] as styled span
        formatted = formatted.replace(/\[cite:([^\]]+)\]/g, '<span class="text-xs text-sky-300 ml-1">[$1]</span>');
        
        // Handle lists
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
            // Fallback: just newlines to <br>
            formatted = formatted.replace(/\n/g, '<br>');
        }
        
        return formatted;
    },
    
    /**
     * Setup article interactions
     */
    setupArticleInteractions() {
        // Add hover effects for punishment values
        document.querySelectorAll('.punishment-value').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                // Show tooltip with parsed information if available
                if (window.PunishmentParser) {
                    const parsed = window.PunishmentParser.parse('', el.textContent);
                    if (parsed.fineMax > 0 || parsed.jailMaxDays > 0) {
                        this.showTooltip(e.target, `Parsed: ${window.PunishmentParser.formatCurrency(parsed.fineMax)} / ${window.PunishmentParser.formatDuration(parsed.jailMaxDays)}`);
                    }
                }
            });
            
            el.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
        
        // Add double-click to copy functionality
        document.querySelectorAll('.penal-code-article').forEach(article => {
            article.addEventListener('dblclick', () => {
                this.copyArticle(article);
            });
        });
    },
    
    /**
     * Extract article data
     */
    extractArticleData(article) {
        const title = article.querySelector('h2, h3, h4')?.textContent?.trim() || '';
        const code = article.querySelector('h3')?.textContent?.trim() || '';
        const text = article.querySelector('.text-gray-300')?.innerHTML || article.textContent;
        const subtitle = article.dataset.subtitle || '';
        
        // Extract punishment and fine
        const punishmentElements = article.querySelectorAll('.punishment-value');
        let punishment = '';
        let fine = '';
        
        punishmentElements.forEach(el => {
            const parent = el.parentElement;
            if (parent.textContent.toLowerCase().includes('punishment')) {
                punishment = el.textContent;
            } else if (parent.textContent.toLowerCase().includes('fine')) {
                fine = el.textContent;
            }
        });
        
        return {
            id: article.id,
            code: code,
            title: subtitle || title,
            text: text,
            articleTitle: title,
            punishment: punishment,
            fine: fine
        };
    },
    
    /**
     * Export current view
     */
    async exportCurrentView() {
        try {
            const content = this.contentContainer.innerHTML;
            const reportData = {
                type: 'generic',
                title: 'Los Santos Penal Code - Current View',
                html: content,
                text: this.contentContainer.textContent
            };
            
            if (window.electronAPI) {
                const result = await window.electronAPI.exportPDF(reportData, {
                    title: 'Current View Export',
                    format: 'legal'
                });
                
                if (result.success) {
                    this.showNotification(`Exported to: ${result.path}`, 'success');
                }
            } else {
                this.showNotification('Export feature requires desktop application', 'error');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    },
    
    /**
     * Export single article
     */
    async exportArticle(articleData) {
        try {
            if (window.electronAPI && window.ReportTemplates) {
                const reportData = window.ReportTemplates.generateArticleReport(articleData);
                const result = await window.electronAPI.exportPDF(reportData, {
                    title: `Article ${articleData.code}`,
                    format: 'legal'
                });
                
                if (result.success) {
                    this.showNotification(`Article exported to: ${result.path}`, 'success');
                }
            } else {
                this.showNotification('Export feature requires desktop application', 'error');
            }
        } catch (error) {
            console.error('Article export failed:', error);
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    },
    
    /**
     * Copy article
     */
    async copyArticle(article) {
        const articleData = this.extractArticleData(article);
        
        if (window.ClipboardUtil) {
            const success = await window.ClipboardUtil.copyArticleContent(articleData);
            this.showNotification(success ? 'Article copied!' : 'Copy failed', success ? 'success' : 'error');
        }
    },
    
    /**
     * Print article
     */
    printArticle(article) {
        // Create a new window with just the article content
        const printWindow = window.open('', '_blank');
        const articleData = this.extractArticleData(article);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Los Santos Penal Code - ${articleData.code}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; }
                    h2 { color: #666; }
                    .punishment-value { color: #dc2626; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Los Santos Penal Code</h1>
                <h2>${articleData.code} - ${articleData.title}</h2>
                <div>${articleData.text}</div>
                ${articleData.punishment ? `<p><strong>Punishment:</strong> ${articleData.punishment}</p>` : ''}
                ${articleData.fine ? `<p><strong>Fine:</strong> ${articleData.fine}</p>` : ''}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    },
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.floatingButtons && window.floatingButtons.showNotification) {
            window.floatingButtons.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    },
    
    /**
     * Show tooltip
     */
    showTooltip(element, text) {
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip fixed bg-black text-white px-2 py-1 rounded text-xs z-50';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        
        this.currentTooltip = tooltip;
    },
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    },
    
    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },
    
    /**
     * Close modals
     */
    closeModals() {
        // Close calculator
        if (window.penalCodeCalculator && window.penalCodeCalculator.isVisible) {
            window.penalCodeCalculator.hideCalculator();
        }
        
        // Close bookmarks
        if (window.bookmarksManager && window.bookmarksManager.isVisible) {
            window.bookmarksManager.hideBookmarks();
        }
        
        // Close context menus
        this.hideContextMenus();
        
        // Close tooltips
        this.hideTooltip();
    },
    
    /**
     * Setup auto-save
     */
    setupAutoSave() {
        setInterval(() => {
            this.saveApplicationState();
        }, 30000); // Save every 30 seconds
    },
    
    /**
     * Save application state
     */
    saveApplicationState() {
        try {
            const state = {
                language: window.languageManager ? window.languageManager.currentLang : 'en',
                theme: document.documentElement.getAttribute('data-theme'),
                scrollPosition: window.scrollY,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('app-state', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save application state:', error);
        }
    },
    
    /**
     * Load user preferences
     */
    loadUserPreferences() {
        try {
            const state = localStorage.getItem('app-state');
            if (state) {
                const parsed = JSON.parse(state);
                
                // Restore scroll position
                if (parsed.scrollPosition) {
                    setTimeout(() => {
                        window.scrollTo(0, parsed.scrollPosition);
                    }, 1000);
                }
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    },
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log(`Application load time: ${loadTime}ms`);
                }, 0);
            });
        }
    },
    
    /**
     * Setup analytics
     */
    setupAnalytics() {
        // Track usage statistics (privacy-respecting)
        const analytics = {
            appStart: new Date().toISOString(),
            platform: window.platform ? window.platform.platform : 'web',
            version: '1.0.0'
        };
        
        console.log('Analytics initialized:', analytics);
    },
    
    /**
     * Setup auto-updater
     */
    setupAutoUpdater() {
        // Check for updates if in Electron
        if (window.electronAPI) {
            // This would be implemented in the main process
            console.log('Auto-updater ready');
        }
    },
    
    /**
     * Setup protocol handlers
     */
    setupProtocolHandlers() {
        // Handle custom protocol links (e.g., lspc://article/1-01)
        if (window.electronAPI) {
            // This would be handled by the main process
            console.log('Protocol handlers ready');
        }
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
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    appManager.init();
});

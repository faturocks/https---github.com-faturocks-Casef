/**
 * Enhanced Floating Buttons for Desktop Application
 * Includes back to top, calculator, bookmarks, and other quick actions
 */
(function() {
    let floatingButtons = [];
    
    function createFloatingButtons() {
        // Remove existing buttons
        floatingButtons.forEach(btn => {
            if (btn.parentNode) {
                btn.parentNode.removeChild(btn);
            }
        });
        floatingButtons = [];
        
        // Back to Top Button
        createBackToTopButton();
        
        // Calculator Quick Access (Desktop only)
        if (window.platform && window.platform.isElectron) {
            createCalculatorButton();
            createBookmarkButton();
            createExportButton();
        }
        
        // Copy Current Article Button
        createCopyButton();
    }
    
    function createBackToTopButton() {
        if (document.getElementById('back-to-top-btn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'back-to-top-btn';
        btn.title = 'Back to Top (G)';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
        `;
        btn.className = 'fixed z-50 bottom-6 right-6 md:bottom-10 md:right-10 p-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg transition-all opacity-0 pointer-events-none';
        btn.style.transition = 'opacity 0.2s, transform 0.2s';
        
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        document.body.appendChild(btn);
        floatingButtons.push(btn);
        
        // Show/hide on scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            } else {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    function createCalculatorButton() {
        const btn = document.createElement('button');
        btn.id = 'float-calculator-btn';
        btn.title = 'Fine & Jail Calculator (Ctrl+K)';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
            </svg>
        `;
        btn.className = 'fixed z-40 bottom-20 right-6 md:bottom-[70px] md:right-10 p-3 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300';
        
        btn.addEventListener('click', function() {
            if (window.penalCodeCalculator) {
                window.penalCodeCalculator.showCalculator();
            }
        });
        
        document.body.appendChild(btn);
        floatingButtons.push(btn);
    }
    
    function createBookmarkButton() {
        const btn = document.createElement('button');
        btn.id = 'float-bookmark-btn';
        btn.title = 'Bookmarks Manager (Ctrl+B)';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        `;
        btn.className = 'fixed z-40 bottom-32 right-6 md:bottom-[130px] md:right-10 p-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-all duration-300';
        
        btn.addEventListener('click', function() {
            if (window.bookmarksManager) {
                window.bookmarksManager.showBookmarks();
            }
        });
        
        document.body.appendChild(btn);
        floatingButtons.push(btn);
    }
    
    function createExportButton() {
        const btn = document.createElement('button');
        btn.id = 'float-export-btn';
        btn.title = 'Export Current View (Ctrl+E)';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        `;
        btn.className = 'fixed z-40 bottom-44 right-6 md:bottom-[190px] md:right-10 p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-300';
        
        btn.addEventListener('click', async function() {
            try {
                const content = document.getElementById('penal-code-content').innerHTML;
                const reportData = {
                    type: 'generic',
                    title: 'Los Santos Penal Code - Current View',
                    html: content,
                    text: document.getElementById('penal-code-content').textContent
                };
                
                if (window.electronAPI) {
                    const result = await window.electronAPI.exportPDF(reportData, {
                        title: 'Current View Export',
                        format: 'legal'
                    });
                    
                    if (result.success) {
                        showNotification(`Exported to: ${result.path}`, 'success');
                    }
                } else {
                    showNotification('Export feature requires desktop application', 'error');
                }
            } catch (error) {
                console.error('Export failed:', error);
                showNotification('Export failed: ' + error.message, 'error');
            }
        });
        
        document.body.appendChild(btn);
        floatingButtons.push(btn);
    }
    
    function createCopyButton() {
        const btn = document.createElement('button');
        btn.id = 'float-copy-btn';
        btn.title = 'Copy Current Article (Ctrl+Shift+C)';
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        `;
        
        const baseClass = 'fixed z-40 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 opacity-0 pointer-events-none';
        const desktopClass = window.platform && window.platform.isElectron ? 
            'bottom-56 right-6 md:bottom-[250px] md:right-10' : 
            'bottom-20 right-6 md:bottom-[70px] md:right-10';
            
        btn.className = `${baseClass} ${desktopClass}`;
        
        btn.addEventListener('click', async function() {
            try {
                await copyCurrentArticle();
            } catch (error) {
                console.error('Copy failed:', error);
                showNotification('Copy failed: ' + error.message, 'error');
            }
        });
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                copyCurrentArticle();
            }
        });
        
        document.body.appendChild(btn);
        floatingButtons.push(btn);
        
        // Show/hide based on visible article
        window.addEventListener('scroll', function() {
            const visibleArticle = getCurrentVisibleArticle();
            if (visibleArticle && window.scrollY > 200) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            } else {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    async function copyCurrentArticle() {
        const currentArticle = getCurrentVisibleArticle();
        if (!currentArticle) {
            showNotification('No article is currently visible', 'error');
            return;
        }
        
        const articleData = extractArticleData(currentArticle);
        
        if (window.ClipboardUtil) {
            const success = await window.ClipboardUtil.copyArticleContent(articleData);
            if (success) {
                showNotification('Article copied to clipboard!', 'success');
            } else {
                showNotification('Failed to copy article', 'error');
            }
        } else {
            // Fallback to simple text copy
            const text = currentArticle.textContent;
            try {
                await navigator.clipboard.writeText(text);
                showNotification('Article copied to clipboard!', 'success');
            } catch (error) {
                showNotification('Failed to copy article', 'error');
            }
        }
    }
    
    function getCurrentVisibleArticle() {
        const articles = document.querySelectorAll('section[id], article[id]');
        const scrollPosition = window.scrollY + 150;
        
        let currentArticle = null;
        articles.forEach(article => {
            const articleTop = article.offsetTop;
            const articleBottom = articleTop + article.offsetHeight;
            
            if (scrollPosition >= articleTop && scrollPosition < articleBottom) {
                currentArticle = article;
            }
        });
        
        return currentArticle;
    }
    
    function extractArticleData(article) {
        const title = article.querySelector('h2, h3, h4')?.textContent?.trim() || '';
        const code = article.querySelector('h3')?.textContent?.trim() || '';
        const text = article.querySelector('.text-gray-300')?.innerHTML || article.textContent;
        const subtitle = article.dataset.subtitle || '';
        
        // Extract punishment and fine if available
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
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only handle if no input is focused
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        // Calculator shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (window.penalCodeCalculator) {
                window.penalCodeCalculator.showCalculator();
            }
        }
        
        // Bookmarks shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            if (window.bookmarksManager) {
                window.bookmarksManager.showBookmarks();
            }
        }
        
        // Export shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            document.getElementById('float-export-btn')?.click();
        }
        
        // Print shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', createFloatingButtons);
    
    // Reinitialize when window resizes (for responsive behavior)
    window.addEventListener('resize', function() {
        setTimeout(createFloatingButtons, 100);
    });
    
    // Export for external use
    window.floatingButtons = {
        refresh: createFloatingButtons,
        showNotification: showNotification
    };
})();

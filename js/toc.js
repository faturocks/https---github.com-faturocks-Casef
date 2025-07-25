/**
 * Table of Contents Manager for Desktop Application
 * Enhanced with desktop-specific features and database integration
 */
const tocManager = {
    /**
     * Initialize TOC manager
     */
    init() {
        this.tocContainer = document.querySelector('#table-of-contents ul');
        this.sidebarElement = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebarClose = document.getElementById('sidebar-close');
        
        // Add event listeners for sidebar toggle on mobile
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.sidebarElement.classList.add('open');
            });
        }
        
        if (this.sidebarClose) {
            this.sidebarClose.addEventListener('click', () => {
                this.sidebarElement.classList.remove('open');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && 
                this.sidebarElement && 
                this.sidebarElement.classList.contains('open') && 
                !this.sidebarElement.contains(e.target) && 
                e.target !== this.sidebarToggle) {
                this.sidebarElement.classList.remove('open');
            }
        });
        
        // Desktop-specific enhancements
        this.setupDesktopFeatures();
        
        console.log('TOC manager initialized with desktop features');
    },
    
    /**
     * Setup desktop-specific features
     */
    setupDesktopFeatures() {
        // Right-click context menu for TOC items
        this.setupContextMenu();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Drag and drop for calculator
        this.setupDragAndDrop();
    },
    
    /**
     * Setup right-click context menu
     */
    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const tocLink = e.target.closest('.toc-link, .toc-sublink');
            if (tocLink) {
                e.preventDefault();
                this.showContextMenu(e, tocLink);
            }
        });
        
        // Close context menu on outside click
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    },
    
    /**
     * Show context menu for TOC item
     */
    showContextMenu(e, tocLink) {
        this.hideContextMenu(); // Hide any existing menu
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="goto">Go to Section</div>
            <div class="context-menu-item" data-action="bookmark">Add Bookmark</div>
            <div class="context-menu-item" data-action="calculator">Add to Calculator</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="copy-link">Copy Section Link</div>
            <div class="context-menu-item" data-action="export">Export Section</div>
        `;
        
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        document.body.appendChild(menu);
        
        // Add click handlers
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const sectionId = tocLink.getAttribute('href')?.substring(1);
            
            this.handleContextMenuAction(action, sectionId, tocLink);
            this.hideContextMenu();
        });
        
        this.currentContextMenu = menu;
    },
    
    /**
     * Hide context menu
     */
    hideContextMenu() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    },
    
    /**
     * Handle context menu actions
     */
    async handleContextMenuAction(action, sectionId, tocLink) {
        switch (action) {
            case 'goto':
                this.scrollToSection('#' + sectionId);
                break;
                
            case 'bookmark':
                if (window.bookmarksManager) {
                    const title = tocLink.textContent.trim();
                    await window.bookmarksManager.addBookmark(sectionId, title);
                    this.showNotification('Section bookmarked!', 'success');
                }
                break;
                
            case 'calculator':
                if (window.penalCodeCalculator) {
                    window.penalCodeCalculator.showCalculator();
                    // Note: Would need integration to pre-select the section
                    this.showNotification('Calculator opened. Please select the section.', 'info');
                }
                break;
                
            case 'copy-link':
                if (window.ClipboardUtil) {
                    const url = window.location.origin + window.location.pathname + '#' + sectionId;
                    await window.ClipboardUtil.copyText(url);
                    this.showNotification('Section link copied!', 'success');
                }
                break;
                
            case 'export':
                await this.exportSection(sectionId);
                break;
        }
    },
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle if TOC is focused or no input is focused
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key) {
                case 'j': // Next section
                    e.preventDefault();
                    this.navigateToNextSection();
                    break;
                case 'k': // Previous section
                    e.preventDefault();
                    this.navigateToPreviousSection();
                    break;
                case 'g': // Go to top
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    break;
                case 'G': // Go to bottom
                    e.preventDefault();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    break;
            }
        });
    },
    
    /**
     * Navigate to next section
     */
    navigateToNextSection() {
        const currentActive = document.querySelector('.toc-sublink.active, .toc-link.active');
        if (currentActive) {
            const allLinks = Array.from(document.querySelectorAll('.toc-link, .toc-sublink'));
            const currentIndex = allLinks.indexOf(currentActive);
            const nextLink = allLinks[currentIndex + 1];
            
            if (nextLink) {
                this.scrollToSection(nextLink.getAttribute('href'));
            }
        }
    },
    
    /**
     * Navigate to previous section
     */
    navigateToPreviousSection() {
        const currentActive = document.querySelector('.toc-sublink.active, .toc-link.active');
        if (currentActive) {
            const allLinks = Array.from(document.querySelectorAll('.toc-link, .toc-sublink'));
            const currentIndex = allLinks.indexOf(currentActive);
            const prevLink = allLinks[currentIndex - 1];
            
            if (prevLink) {
                this.scrollToSection(prevLink.getAttribute('href'));
            }
        }
    },
    
    /**
     * Setup drag and drop for calculator integration
     */
    setupDragAndDrop() {
        // Make TOC items draggable
        document.addEventListener('DOMContentLoaded', () => {
            this.makeItemsDraggable();
        });
    },
    
    /**
     * Make TOC items draggable
     */
    makeItemsDraggable() {
        const tocItems = document.querySelectorAll('.toc-sublink');
        tocItems.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', (e) => {
                const sectionId = item.getAttribute('href').substring(1);
                const sectionTitle = item.textContent.trim();
                
                e.dataTransfer.setData('text/plain', sectionId);
                e.dataTransfer.setData('application/json', JSON.stringify({
                    id: sectionId,
                    title: sectionTitle,
                    type: 'penal-section'
                }));
                
                // Visual feedback
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
        });
    },
    
    /**
     * Render the table of contents with enhanced features
     * @param {Array} data - Penal code data
     */
    renderTOC(data) {
        if (!this.tocContainer) return;
        
        let tocHtml = '';
        
        data.forEach(title => {
            // Get title from appropriate language field
            let judul = '';
            if (typeof title.title === 'string' && title.title.trim()) {
                judul = title.title;
            } else if (typeof title.title_id === 'string' && title.title_id.trim()) {
                judul = title.title_id;
            }
            if (!judul) return;
            
            const titleId = title.id;
            if (!Array.isArray(title.sections)) return;
            const sectionCount = title.sections.length;
            
            tocHtml += `
                <li class="toc-item">
                    <div class="toc-header flex items-center gap-2">
                        <button class="toc-collapse-btn collapsed transition-transform duration-200" aria-expanded="false" aria-controls="${titleId}-sections">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 toc-collapse-icon transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <a href="#${titleId}" class="toc-link text-base md:text-[1.08rem] font-semibold text-sky-300 hover:text-sky-400 transition-colors mb-1 block cursor-pointer">
                            ${judul.replace(/\./g, '')}
                            <span class="section-count text-[0.7rem] text-gray-500 ml-1 align-middle">(${sectionCount})</span>
                        </a>
                    </div>
                    <ul id="${titleId}-sections" class="toc-sections hidden ml-6 border-l border-gray-700/50 pl-3 mt-2">
            `;
            
            // Add sub-items for each section
            title.sections.forEach(section => {
                const codeValue = section.code || section.code_id || '';
                if (!codeValue) return;
                const sectionId = `${titleId}-${codeValue.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()}`;
                
                tocHtml += `
                    <li class="toc-subitem">
                        <a href="#${sectionId}" class="toc-sublink text-xs md:text-sm text-gray-400 hover:text-sky-400 pl-1 block py-0.5 transition-colors" draggable="true" title="Right-click for options">
                            ${codeValue}
                        </a>
                    </li>
                `;
            });
            
            tocHtml += `
                    </ul>
                </li>
            `;
        });
        
        this.tocContainer.innerHTML = tocHtml;
        this.setupTOCInteractivity();
        this.makeItemsDraggable(); // Re-setup drag and drop after rendering
    },
    
    /**
     * Setup TOC interactivity (collapse/expand, active highlighting)
     */
    setupTOCInteractivity() {
        // Setup collapse/expand functionality
        document.querySelectorAll('.toc-collapse-btn').forEach(btn => {
            const targetId = btn.getAttribute('aria-controls');
            const targetElement = document.getElementById(targetId);
            
            // Start collapsed
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.add('collapsed');
            if (targetElement) {
                targetElement.classList.add('collapsed', 'hidden');
            }
            
            // Collapse by button only
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTocSection(btn, targetElement);
            });
            
            // Collapse/expand + scroll by clicking the title text
            const tocLink = btn.parentElement.querySelector('.toc-link');
            if (tocLink) {
                tocLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const expanded = btn.getAttribute('aria-expanded') === 'true';
                    if (!expanded) {
                        this.toggleTocSection(btn, targetElement);
                        setTimeout(() => {
                            this.scrollToSection(tocLink.getAttribute('href'));
                        }, 150);
                    } else {
                        this.scrollToSection(tocLink.getAttribute('href'));
                    }
                });
            }
        });
        
        // Setup smooth scrolling for TOC sublinks
        document.querySelectorAll('.toc-sublink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(link.getAttribute('href'));
            });
        });
        
        // Setup scroll spy
        this.setupScrollSpy();
    },
    
    /**
     * Toggle TOC section expansion
     */
    toggleTocSection(btn, targetElement) {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.add('collapsed');
            if (targetElement) {
                targetElement.classList.add('collapsed', 'hidden');
            }
            const icon = btn.querySelector('.toc-collapse-icon');
            if (icon) icon.style.transform = '';
        } else {
            btn.setAttribute('aria-expanded', 'true');
            btn.classList.remove('collapsed');
            if (targetElement) {
                targetElement.classList.remove('collapsed', 'hidden');
            }
            const icon = btn.querySelector('.toc-collapse-icon');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    },
    
    /**
     * Scroll to section with enhanced features
     */
    scrollToSection(href) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Close sidebar on mobile
            if (window.innerWidth < 768 && this.sidebarElement) {
                this.sidebarElement.classList.remove('open');
            }
            
            // Smooth scroll to target
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
            
            // Update active link
            this.updateActiveTocLink(targetId);
            
            // Visual highlight effect
            this.highlightElement(targetElement);
        }
    },
    
    /**
     * Highlight element with visual effect
     */
    highlightElement(element) {
        element.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';
        element.style.transition = 'background-color 0.3s ease';
        
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    },
    
    /**
     * Setup scroll spy to highlight active TOC item
     */
    setupScrollSpy() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },
    
    /**
     * Update active section based on scroll position
     */
    updateActiveSection() {
        const scrollPosition = window.scrollY;
        let currentSectionId = '';
        
        // Find the current section based on scroll position
        document.querySelectorAll('section[id], article[id]').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop - 150 && 
                scrollPosition < sectionTop + sectionHeight - 100) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        if (currentSectionId) {
            this.updateActiveTocLink(currentSectionId);
        }
    },
    
    /**
     * Update active TOC link
     * @param {string} sectionId - ID of the active section
     */
    updateActiveTocLink(sectionId) {
        // Remove active class from all links
        document.querySelectorAll('.toc-link, .toc-sublink').forEach(link => {
            link.classList.remove('active', 'bg-sky-500', 'text-white', 'rounded');
            link.style.textDecoration = '';
            link.style.background = '';
        });
        
        // Add active class to current link
        const currentLink = document.querySelector(`.toc-link[href="#${sectionId}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
            currentLink.style.textDecoration = 'underline';
            currentLink.style.background = 'none';
            
            // Expand parent if it's collapsed
            this.expandParentSection(currentLink);
        }
        
        // Check for sublinks
        const currentSublink = document.querySelector(`.toc-sublink[href="#${sectionId}"]`);
        if (currentSublink) {
            currentSublink.classList.add('active');
            
            // Expand parent and highlight parent title
            this.expandParentSection(currentSublink);
        }
    },
    
    /**
     * Expand parent section if collapsed
     */
    expandParentSection(link) {
        const parentItem = link.closest('.toc-item');
        if (parentItem) {
            const parentLink = parentItem.querySelector('.toc-link');
            const collapseBtn = parentItem.querySelector('.toc-collapse-btn');
            const sectionsContainer = parentItem.querySelector('.toc-sections');
            
            if (parentLink) parentLink.classList.add('active');
            if (collapseBtn && sectionsContainer) {
                collapseBtn.setAttribute('aria-expanded', 'true');
                collapseBtn.classList.remove('collapsed');
                sectionsContainer.classList.remove('collapsed', 'hidden');
                
                const icon = collapseBtn.querySelector('.toc-collapse-icon');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        }
    },
    
    /**
     * Export section to PDF
     */
    async exportSection(sectionId) {
        try {
            const section = document.getElementById(sectionId);
            if (!section) {
                this.showNotification('Section not found', 'error');
                return;
            }
            
            const sectionData = this.extractSectionData(section);
            
            if (window.electronAPI && window.ReportTemplates) {
                const reportData = window.ReportTemplates.generateArticleReport(sectionData);
                const result = await window.electronAPI.exportPDF(reportData, {
                    title: `Section ${sectionData.code}`,
                    format: 'legal'
                });
                
                if (result.success) {
                    this.showNotification(`Section exported to: ${result.path}`, 'success');
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
     * Extract section data for export
     */
    extractSectionData(section) {
        const title = section.querySelector('h2, h3, h4')?.textContent?.trim() || '';
        const code = section.querySelector('h3')?.textContent?.trim() || '';
        const text = section.querySelector('.text-gray-300')?.textContent?.trim() || '';
        const subtitle = section.dataset.subtitle || '';
        
        return {
            id: section.id,
            code: code,
            title: subtitle || title,
            text: text,
            articleTitle: title
        };
    },
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    tocManager.init();
    window.tocManager = tocManager;
});

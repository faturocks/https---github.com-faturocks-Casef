/**
 * Table of Contents Manager
 * Handles TOC rendering, navigation, and interactivity
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
        
        console.log('TOC manager initialized');
    },
    
    /**
     * Render the table of contents
     * @param {Array} data - Penal code data
     */
    renderTOC(data) {
        if (!this.tocContainer) return;
        
        let tocHtml = '';
        
        data.forEach(title => {
            // Ambil judul dari title atau title_id
            let judul = '';
            if (typeof title.title === 'string' && title.title.trim()) {
                judul = title.title;
            } else if (typeof title.title_id === 'string' && title.title_id.trim()) {
                judul = title.title_id;
            }
            if (!judul) return; // skip jika tetap kosong
            const titleId = title.id;
            // Pastikan sections array, jika tidak skip
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
                if (!codeValue) return; // skip jika tidak ada code
                const sectionId = `${titleId}-${codeValue.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()}`;
                
                tocHtml += `
                    <li class="toc-subitem">
                        <a href="#${sectionId}" class="toc-sublink text-xs md:text-sm text-gray-400 hover:text-sky-400 pl-1 block py-0.5 transition-colors">
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
            // Collapse by button only (panah)
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleTocSection(btn, targetElement);
            });
            // Collapse/expand + scroll by clicking the title text
            const tocLink = btn.parentElement.querySelector('.toc-link');
            if (tocLink) {
                tocLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const expanded = btn.getAttribute('aria-expanded') === 'true';
                    if (!expanded) {
                        toggleTocSection(btn, targetElement);
                        // Tunggu transisi, lalu scroll
                        setTimeout(() => {
                            scrollToSection(tocLink.getAttribute('href'));
                        }, 150);
                    } else {
                        scrollToSection(tocLink.getAttribute('href'));
                    }
                });
            }
        });
        // Helper for toggling
        function toggleTocSection(btn, targetElement) {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                btn.setAttribute('aria-expanded', 'false');
                btn.classList.add('collapsed');
                if (targetElement) {
                    targetElement.classList.add('collapsed', 'hidden');
                }
                // Rotate icon up
                const icon = btn.querySelector('.toc-collapse-icon');
                if (icon) icon.style.transform = '';
            } else {
                btn.setAttribute('aria-expanded', 'true');
                btn.classList.remove('collapsed');
                if (targetElement) {
                    targetElement.classList.remove('collapsed', 'hidden');
                }
                // Rotate icon down
                const icon = btn.querySelector('.toc-collapse-icon');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        }
        
        // Setup smooth scrolling for TOC sublinks only (section)
        document.querySelectorAll('.toc-sublink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToSection(link.getAttribute('href'));
            });
        });
        // Helper for scroll
        function scrollToSection(href) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Close sidebar on mobile
                if (window.innerWidth < 768 && tocManager.sidebarElement) {
                    tocManager.sidebarElement.classList.remove('open');
                }
                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                // Update active link
                tocManager.updateActiveTocLink(targetId);
            }
        }
        
        // Setup scroll spy
        this.setupScrollSpy();
    },
    
    /**
     * Setup scroll spy to highlight active TOC item
     */
    setupScrollSpy() {
        // Throttled scroll event listener
        window.addEventListener('scroll', this.throttle(() => {
            const scrollPosition = window.scrollY;
            let currentSectionId = '';
            
            // Find the current section based on scroll position
            document.querySelectorAll('section[id]').forEach(section => {
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
        }, 100));
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
            currentLink.style.textDecoration = 'underline'; // highlight aktif subtle
            currentLink.style.background = 'none';
            
            // Expand parent if it's collapsed
            const parentItem = currentLink.closest('.toc-item');
            if (parentItem) {
                const collapseBtn = parentItem.querySelector('.toc-collapse-btn');
                const sectionsContainer = parentItem.querySelector('.toc-sections');
                
                if (collapseBtn && sectionsContainer) {
                    collapseBtn.setAttribute('aria-expanded', 'true');
                    collapseBtn.classList.remove('collapsed');
                    sectionsContainer.classList.remove('collapsed');
                }
            }
        }
        
        // Check for sublinks
        const currentSublink = document.querySelector(`.toc-sublink[href="#${sectionId}"]`);
        if (currentSublink) {
            currentSublink.classList.add('active');
            
            // Expand parent and highlight parent title
            const parentItem = currentSublink.closest('.toc-item');
            if (parentItem) {
                const parentLink = parentItem.querySelector('.toc-link');
                const collapseBtn = parentItem.querySelector('.toc-collapse-btn');
                const sectionsContainer = parentItem.querySelector('.toc-sections');
                
                if (parentLink) parentLink.classList.add('active');
                if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'true');
                if (collapseBtn) collapseBtn.classList.remove('collapsed');
                if (sectionsContainer) sectionsContainer.classList.remove('collapsed');
            }
        }
    },
    
    /**
     * Throttle function to limit how often a function is called
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    tocManager.init();
    window.tocManager = tocManager;
});
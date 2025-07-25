/**
 * Bookmarks Manager
 * Handles bookmark functionality for articles and sections
 */
class BookmarksManager {
    constructor() {
        this.bookmarks = new Map();
        this.isVisible = false;
        this.init();
    }

    init() {
        this.createBookmarksUI();
        this.setupEventListeners();
        this.loadBookmarks();
        
        // Make globally available
        window.bookmarksManager = this;
        
        console.log('Bookmarks Manager initialized');
    }

    createBookmarksUI() {
        // Create bookmarks modal
        const bookmarksHTML = `
            <div id="bookmarks-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <!-- Header -->
                        <div class="bg-gray-800 px-6 py-4 flex items-center justify-between">
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                Bookmarks Manager
                            </h2>
                            <div class="flex items-center gap-2">
                                <button id="export-bookmarks" class="text-purple-400 hover:text-purple-300 transition-colors" title="Export Bookmarks">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </button>
                                <button id="close-bookmarks" class="text-gray-400 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="flex h-[calc(90vh-4rem)]">
                            <!-- Left Panel: Bookmarks List -->
                            <div class="w-2/3 bg-gray-900 flex flex-col">
                                <div class="p-4 border-b border-gray-700">
                                    <div class="flex items-center justify-between mb-3">
                                        <h3 class="font-semibold text-white">Your Bookmarks</h3>
                                        <button id="clear-all-bookmarks" class="text-red-400 hover:text-red-300 text-sm">
                                            Clear All
                                        </button>
                                    </div>
                                    <input type="text" id="bookmarks-search" placeholder="Search bookmarks..." 
                                           class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none text-sm">
                                </div>
                                <div id="bookmarks-list" class="flex-1 overflow-y-auto p-4">
                                    <div id="no-bookmarks" class="text-center text-gray-400 mt-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <p>No bookmarks yet</p>
                                        <p class="text-xs mt-1">Bookmark articles to save them for quick access</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Panel: Bookmark Details/Actions -->
                            <div class="w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col">
                                <div class="p-4 border-b border-gray-700">
                                    <h3 class="font-semibold text-white mb-3">Quick Actions</h3>
                                    <div class="space-y-2">
                                        <button id="bookmark-current-article" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Bookmark Current Article
                                        </button>
                                        <button id="organize-bookmarks" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                            Organize Bookmarks
                                        </button>
                                    </div>
                                </div>
                                <div id="bookmark-details" class="flex-1 overflow-y-auto p-4">
                                    <div id="no-selection" class="text-center text-gray-400 mt-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p class="text-sm">Select a bookmark to view details</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer: Statistics -->
                        <div class="bg-gray-800 border-t border-gray-700 p-4">
                            <div class="flex items-center justify-between text-sm text-gray-400">
                                <span id="bookmarks-count">0 bookmarks</span>
                                <span id="bookmarks-last-updated">Never updated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bookmark Button (floating) -->
            <button id="bookmark-toggle" class="fixed z-40 bottom-20 right-6 md:bottom-24 md:right-10 p-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-all duration-300 opacity-0 pointer-events-none" title="Toggle Bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', bookmarksHTML);
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('close-bookmarks').addEventListener('click', () => {
            this.hideBookmarks();
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideBookmarks();
            }
        });

        // Close on outside click
        document.getElementById('bookmarks-modal').addEventListener('click', (e) => {
            if (e.target.id === 'bookmarks-modal') {
                this.hideBookmarks();
            }
        });

        // Search functionality
        document.getElementById('bookmarks-search').addEventListener('input', (e) => {
            this.filterBookmarks(e.target.value);
        });

        // Actions
        document.getElementById('bookmark-current-article').addEventListener('click', () => {
            this.bookmarkCurrentArticle();
        });

        document.getElementById('clear-all-bookmarks').addEventListener('click', () => {
            this.clearAllBookmarks();
        });

        document.getElementById('export-bookmarks').addEventListener('click', () => {
            this.exportBookmarks();
        });

        document.getElementById('organize-bookmarks').addEventListener('click', () => {
            this.organizeBookmarks();
        });

        // Floating bookmark button
        document.getElementById('bookmark-toggle').addEventListener('click', () => {
            this.toggleCurrentArticleBookmark();
        });

        // Update floating button on scroll
        this.setupScrollListener();

        // Electron menu integration
        if (window.electronAPI) {
            window.electronAPI.onManageBookmarks(() => this.showBookmarks());
        }
    }

    setupScrollListener() {
        let currentArticleId = null;
        
        window.addEventListener('scroll', this.throttle(() => {
            const articles = document.querySelectorAll('section[id], article[id]');
            const scrollPosition = window.scrollY + 150;
            
            let activeArticle = null;
            articles.forEach(article => {
                const articleTop = article.offsetTop;
                const articleBottom = articleTop + article.offsetHeight;
                
                if (scrollPosition >= articleTop && scrollPosition < articleBottom) {
                    activeArticle = article;
                }
            });

            if (activeArticle && activeArticle.id !== currentArticleId) {
                currentArticleId = activeArticle.id;
                this.updateFloatingButton(currentArticleId);
            }

            // Show/hide floating button
            const bookmarkBtn = document.getElementById('bookmark-toggle');
            if (window.scrollY > 200 && activeArticle) {
                bookmarkBtn.style.opacity = '1';
                bookmarkBtn.style.pointerEvents = 'auto';
            } else {
                bookmarkBtn.style.opacity = '0';
                bookmarkBtn.style.pointerEvents = 'none';
            }
        }, 100));
    }

    updateFloatingButton(articleId) {
        const bookmarkBtn = document.getElementById('bookmark-toggle');
        const isBookmarked = this.bookmarks.has(articleId);
        
        if (isBookmarked) {
            bookmarkBtn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
            bookmarkBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            bookmarkBtn.title = 'Remove Bookmark';
        } else {
            bookmarkBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            bookmarkBtn.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
            bookmarkBtn.title = 'Add Bookmark';
        }
        
        bookmarkBtn.dataset.articleId = articleId;
    }

    async loadBookmarks() {
        try {
            let bookmarks = [];
            
            if (window.electronAPI) {
                bookmarks = await window.electronAPI.getBookmarks();
            } else {
                // Web fallback
                bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            }

            this.bookmarks.clear();
            bookmarks.forEach(bookmark => {
                this.bookmarks.set(bookmark.article_id || bookmark.id, bookmark);
            });

            this.renderBookmarks();
            this.updateBookmarksStats();
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            this.showError('Failed to load bookmarks.');
        }
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarks-list');
        const noBookmarks = document.getElementById('no-bookmarks');

        if (this.bookmarks.size === 0) {
            noBookmarks.style.display = 'block';
            return;
        }

        noBookmarks.style.display = 'none';
        let html = '';

        this.bookmarks.forEach((bookmark, bookmarkId) => {
            const createdDate = new Date(bookmark.created_at).toLocaleDateString();
            
            html += `
                <div class="bookmark-item bg-gray-800 p-4 rounded border border-gray-700 mb-3 transition-all duration-200 hover:border-yellow-400 cursor-pointer" data-bookmark-id="${bookmarkId}">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-white truncate flex-1">${bookmark.title}</h4>
                        <div class="flex items-center gap-2 ml-2">
                            <button class="edit-bookmark text-blue-400 hover:text-blue-300" data-bookmark-id="${bookmarkId}" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button class="remove-bookmark text-red-400 hover:text-red-300" data-bookmark-id="${bookmarkId}" title="Remove">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="text-gray-400 text-xs mb-2">Added: ${createdDate}</div>
                    ${bookmark.notes ? `<div class="text-gray-300 text-sm truncate">${bookmark.notes}</div>` : ''}
                </div>
            `;
        });

        container.innerHTML = html;

        // Add event listeners for bookmark items
        container.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.selectBookmark(item.dataset.bookmarkId);
                }
            });
        });

        container.querySelectorAll('.edit-bookmark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editBookmark(btn.dataset.bookmarkId);
            });
        });

        container.querySelectorAll('.remove-bookmark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeBookmark(btn.dataset.bookmarkId);
            });
        });
    }

    selectBookmark(bookmarkId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (!bookmark) return;

        // Remove previous selection
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.classList.remove('border-yellow-400', 'bg-gray-700');
        });

        // Highlight selected bookmark
        const selectedItem = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('border-yellow-400', 'bg-gray-700');
        }

        // Show bookmark details
        this.showBookmarkDetails(bookmark);
    }

    showBookmarkDetails(bookmark) {
        const container = document.getElementById('bookmark-details');
        const noSelection = document.getElementById('no-selection');
        
        noSelection.style.display = 'none';

        const createdDate = new Date(bookmark.created_at).toLocaleDateString();
        
        const html = `
            <div class="bookmark-detail">
                <h4 class="font-semibold text-white mb-3">${bookmark.title}</h4>
                <div class="space-y-3">
                    <div>
                        <label class="text-gray-400 text-xs">Created</label>
                        <div class="text-white text-sm">${createdDate}</div>
                    </div>
                    ${bookmark.notes ? `
                        <div>
                            <label class="text-gray-400 text-xs">Notes</label>
                            <div class="text-white text-sm bg-gray-700 p-2 rounded">${bookmark.notes}</div>
                        </div>
                    ` : ''}
                    <div class="pt-3 border-t border-gray-600">
                        <h5 class="text-gray-400 text-xs mb-2">Actions</h5>
                        <div class="space-y-2">
                            <button class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors" onclick="bookmarksManager.goToBookmark('${bookmark.article_id || bookmark.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V5a2 2 0 112 0v1M10 6h4" />
                                </svg>
                                Go to Article
                            </button>
                            <button class="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors" onclick="bookmarksManager.addToCalculator('${bookmark.article_id || bookmark.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add to Calculator
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    async addBookmark(articleId, title, notes = '') {
        try {
            const bookmarkData = {
                article_id: articleId,
                title: title,
                notes: notes,
                created_at: new Date().toISOString()
            };

            if (window.electronAPI) {
                await window.electronAPI.addBookmark(articleId, title, notes);
            } else {
                // Web fallback
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
                bookmarks.unshift({ ...bookmarkData, id: Date.now() });
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks.slice(0, 100))); // Keep last 100
            }

            this.bookmarks.set(articleId, bookmarkData);
            this.renderBookmarks();
            this.updateBookmarksStats();
            this.showSuccess('Article bookmarked successfully!');
        } catch (error) {
            console.error('Error adding bookmark:', error);
            this.showError('Failed to add bookmark.');
        }
    }

    async removeBookmark(bookmarkId) {
        if (!confirm('Are you sure you want to remove this bookmark?')) return;

        try {
            if (window.electronAPI) {
                await window.electronAPI.removeBookmark(bookmarkId);
            } else {
                // Web fallback
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
                const filtered = bookmarks.filter(b => (b.article_id || b.id) !== bookmarkId);
                localStorage.setItem('bookmarks', JSON.stringify(filtered));
            }

            this.bookmarks.delete(bookmarkId);
            this.renderBookmarks();
            this.updateBookmarksStats();
            
            // Clear details if this bookmark was selected
            const container = document.getElementById('bookmark-details');
            const noSelection = document.getElementById('no-selection');
            container.innerHTML = '';
            container.appendChild(noSelection);
            noSelection.style.display = 'block';

            this.showSuccess('Bookmark removed successfully!');
        } catch (error) {
            console.error('Error removing bookmark:', error);
            this.showError('Failed to remove bookmark.');
        }
    }

    editBookmark(bookmarkId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (!bookmark) return;

        const newNotes = prompt('Edit notes for this bookmark:', bookmark.notes || '');
        if (newNotes === null) return; // User cancelled

        // Update bookmark notes
        bookmark.notes = newNotes;
        this.bookmarks.set(bookmarkId, bookmark);

        // Update in storage
        if (window.electronAPI) {
            // Note: This would require a new API method to update bookmark notes
            console.log('Update bookmark notes:', bookmarkId, newNotes);
        } else {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            const updated = bookmarks.map(b => {
                if ((b.article_id || b.id) === bookmarkId) {
                    return { ...b, notes: newNotes };
                }
                return b;
            });
            localStorage.setItem('bookmarks', JSON.stringify(updated));
        }

        this.renderBookmarks();
        this.showSuccess('Bookmark updated successfully!');
    }

    bookmarkCurrentArticle() {
        // Find currently visible article
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

        if (!currentArticle) {
            this.showError('No article is currently visible to bookmark.');
            return;
        }

        const articleId = currentArticle.id;
        const title = currentArticle.querySelector('h2, h3, h4')?.textContent?.trim() || `Article ${articleId}`;

        if (this.bookmarks.has(articleId)) {
            this.showError('This article is already bookmarked.');
            return;
        }

        const notes = prompt('Add notes for this bookmark (optional):') || '';
        this.addBookmark(articleId, title, notes);
    }

    toggleCurrentArticleBookmark() {
        const bookmarkBtn = document.getElementById('bookmark-toggle');
        const articleId = bookmarkBtn.dataset.articleId;
        
        if (!articleId) return;

        if (this.bookmarks.has(articleId)) {
            this.removeBookmark(articleId);
        } else {
            const article = document.getElementById(articleId);
            const title = article?.querySelector('h2, h3, h4')?.textContent?.trim() || `Article ${articleId}`;
            this.addBookmark(articleId, title);
        }
    }

    clearAllBookmarks() {
        if (!confirm('Are you sure you want to remove all bookmarks? This action cannot be undone.')) return;

        try {
            this.bookmarks.clear();
            
            if (window.electronAPI) {
                // This would require a new API method to clear all bookmarks
                console.log('Clear all bookmarks');
            } else {
                localStorage.removeItem('bookmarks');
            }

            this.renderBookmarks();
            this.updateBookmarksStats();
            this.showSuccess('All bookmarks cleared.');
        } catch (error) {
            console.error('Error clearing bookmarks:', error);
            this.showError('Failed to clear bookmarks.');
        }
    }

    filterBookmarks(searchTerm) {
        const items = document.querySelectorAll('.bookmark-item');
        
        if (!searchTerm.trim()) {
            items.forEach(item => item.style.display = 'block');
            return;
        }

        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
    }

    goToBookmark(articleId) {
        const article = document.getElementById(articleId);
        if (article) {
            this.hideBookmarks();
            
            // Smooth scroll to article
            window.scrollTo({
                top: article.offsetTop - 100,
                behavior: 'smooth'
            });

            // Highlight article briefly
            article.style.backgroundColor = 'rgba(251, 191, 36, 0.2)';
            setTimeout(() => {
                article.style.backgroundColor = '';
            }, 2000);
        } else {
            this.showError('Article not found on current page.');
        }
    }

    addToCalculator(articleId) {
        if (window.penalCodeCalculator) {
            window.penalCodeCalculator.showCalculator();
            // Note: This would require integration with the calculator to pre-select the article
            this.hideBookmarks();
            this.showSuccess('Calculator opened. Please manually select the article.');
        } else {
            this.showError('Calculator is not available.');
        }
    }

    async exportBookmarks() {
        try {
            const bookmarksArray = Array.from(this.bookmarks.values());
            const reportData = window.ReportTemplates?.generateBookmarksReport?.(bookmarksArray);
            
            if (window.electronAPI && reportData) {
                const result = await window.electronAPI.exportPDF(reportData, {
                    title: 'Bookmarks Collection',
                    format: 'legal'
                });
                
                if (result.success) {
                    this.showSuccess(`Bookmarks exported to: ${result.path}`);
                }
            } else {
                // Web fallback - download as JSON
                const dataStr = JSON.stringify(bookmarksArray, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bookmarks-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showSuccess('Bookmarks downloaded!');
            }
        } catch (error) {
            console.error('Error exporting bookmarks:', error);
            this.showError('Failed to export bookmarks.');
        }
    }

    organizeBookmarks() {
        // Future feature: organize bookmarks by categories, dates, etc.
        this.showInfo('Bookmark organization feature coming soon!');
    }

    updateBookmarksStats() {
        const countElement = document.getElementById('bookmarks-count');
        const lastUpdatedElement = document.getElementById('bookmarks-last-updated');
        
        if (countElement) {
            const count = this.bookmarks.size;
            countElement.textContent = `${count} bookmark${count !== 1 ? 's' : ''}`;
        }
        
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleString()}`;
        }
    }

    showBookmarks() {
        document.getElementById('bookmarks-modal').classList.remove('hidden');
        this.isVisible = true;
        this.loadBookmarks();
    }

    hideBookmarks() {
        document.getElementById('bookmarks-modal').classList.add('hidden');
        this.isVisible = false;
    }

    showSuccess(message) {
        // Simple success notification - could be enhanced with a proper toast system
        console.log('Success:', message);
        // You might want to implement a proper notification system here
    }

    showError(message) {
        // Simple error notification - could be enhanced with a proper toast system
        console.error('Error:', message);
        // You might want to implement a proper notification system here
    }

    showInfo(message) {
        // Simple info notification - could be enhanced with a proper toast system
        console.info('Info:', message);
        // You might want to implement a proper notification system here
    }

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
}

// Initialize bookmarks manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window !== 'undefined') {
        window.bookmarksManager = new BookmarksManager();
    }
});

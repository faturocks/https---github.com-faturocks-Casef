/**
 * Enhanced Search Manager for Desktop Application
 * Handles search functionality with advanced filtering, highlighting, and history
 */
const searchManager = {
    /**
     * Initialize search manager
     */
    init() {
        // Get DOM elements
        this.searchInput = document.getElementById('search-input');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.contentContainer = document.getElementById('penal-code-content');
        this.noResultsMessage = document.getElementById('no-results');
        this.searchStatsElement = document.getElementById('search-stats');
        this.filterOptions = document.querySelectorAll('input[name="search-filter"]');
        
        // Initialize search state
        this.originalContentHTML = '';
        this.searchHistory = this.loadSearchHistory();
        this.currentSearchTerm = '';
        this.currentFilter = 'all';
        this.searchResults = [];
        this.isSearching = false;
        
        // Setup enhanced features
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupSearchSuggestions();
        this.setupAdvancedFiltering();
        
        console.log('Enhanced Search manager initialized');
    },
    
    /**
     * Setup event listeners with enhanced functionality
     */
    setupEventListeners() {
        // Main search input with debouncing
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.performSearch();
            this.toggleClearButton();
            this.updateSearchSuggestions();
        }, 300));
        
        // Search input focus/blur events
        this.searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions();
        });
        
        this.searchInput.addEventListener('blur', () => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => this.hideSearchSuggestions(), 200);
        });
        
        // Clear search button
        this.clearSearchBtn.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // Filter options with enhanced UI feedback
        this.filterOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.currentFilter = option.value;
                this.performSearch();
                this.updateFilterUI();
                this.saveSearchPreferences();
            });
        });
        
        // Search on Enter key
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(true); // Force immediate search
                this.addToSearchHistory(this.searchInput.value);
            }
        });
    },
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Focus search on Ctrl+F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Clear search on Escape (when search input is focused)
            if (e.key === 'Escape' && document.activeElement === this.searchInput) {
                this.clearSearch();
            }
            
            // Navigate search results with arrow keys
            if (document.activeElement === this.searchInput) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateToFirstResult();
                }
            }
        });
    },
    
    /**
     * Setup search suggestions system
     */
    setupSearchSuggestions() {
        // Create suggestions dropdown
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'search-suggestions';
        suggestionsContainer.className = 'absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-b-lg shadow-lg z-50 hidden max-h-60 overflow-y-auto';
        
        // Insert after search input
        this.searchInput.parentNode.style.position = 'relative';
        this.searchInput.parentNode.appendChild(suggestionsContainer);
        this.suggestionsContainer = suggestionsContainer;
    },
    
    /**
     * Setup advanced filtering
     */
    setupAdvancedFiltering() {
        // Load saved filter preferences
        const savedFilter = localStorage.getItem('searchFilter');
        if (savedFilter && document.querySelector(`input[name="search-filter"][value="${savedFilter}"]`)) {
            document.querySelector(`input[name="search-filter"][value="${savedFilter}"]`).checked = true;
            this.currentFilter = savedFilter;
        }
        
        // Update filter UI
        this.updateFilterUI();
    },
    
    /**
     * Set original content HTML for reset
     * @param {string} html - Original HTML content
     */
    setOriginalContent(html) {
        this.originalContentHTML = html;
    },
    
    /**
     * Focus search input with enhanced UX
     */
    focusSearch() {
        this.searchInput.focus();
        this.searchInput.select();
        this.showSearchSuggestions();
    },
    
    /**
     * Clear search with enhanced reset
     */
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearchTerm = '';
        this.searchResults = [];
        this.performSearch();
        this.toggleClearButton();
        this.hideSearchSuggestions();
        this.searchInput.focus();
        
        // Dispatch clear event
        window.dispatchEvent(new CustomEvent('searchCleared'));
    },
    
    /**
     * Toggle clear button visibility
     */
    toggleClearButton() {
        if (this.searchInput.value.trim() !== '') {
            this.clearSearchBtn.classList.remove('hidden');
        } else {
            this.clearSearchBtn.classList.add('hidden');
        }
    },
    
    /**
     * Perform search with enhanced features
     * @param {boolean} immediate - Whether to search immediately without debouncing
     */
    performSearch(immediate = false) {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        this.currentSearchTerm = searchTerm;
        
        // Reset content if search is empty
        if (searchTerm === '') {
            this.resetContent();
            return;
        }
        
        // Set searching state
        this.isSearching = true;
        this.showSearchingState();
        
        // Reset content for new search
        if (this.originalContentHTML) {
            this.contentContainer.innerHTML = this.originalContentHTML;
        }
        
        // Perform the search
        const results = this.executeSearch(searchTerm, this.currentFilter);
        this.searchResults = results;
        
        // Update UI with results
        this.displaySearchResults(results, searchTerm);
        
        // Update search statistics
        this.updateSearchStats(results.length, searchTerm);
        
        // Save to search history if immediate search
        if (immediate) {
            this.addToSearchHistory(searchTerm);
        }
        
        // Dispatch search event
        window.dispatchEvent(new CustomEvent('searchPerformed', {
            detail: { 
                query: searchTerm, 
                filter: this.currentFilter, 
                resultsCount: results.length 
            }
        }));
        
        this.isSearching = false;
    },
    
    /**
     * Execute search algorithm
     * @param {string} searchTerm - Search term
     * @param {string} filter - Current filter
     * @returns {Array} Search results
     */
    executeSearch(searchTerm, filter) {
        const results = [];
        const allTitles = this.contentContainer.querySelectorAll('.penal-code-title');
        
        allTitles.forEach(titleSection => {
            let titleHasMatch = false;
            const articlesInSection = titleSection.querySelectorAll('.penal-code-article');
            
            articlesInSection.forEach(article => {
                const matchResult = this.checkArticleMatch(article, searchTerm, filter);
                
                if (matchResult.matches) {
                    article.style.display = 'block';
                    titleHasMatch = true;
                    
                    // Store match information
                    results.push({
                        element: article,
                        titleSection: titleSection,
                        matchType: matchResult.matchType,
                        relevanceScore: matchResult.relevanceScore,
                        matches: matchResult.matchPositions
                    });
                    
                    // Highlight matches
                    this.highlightMatches(article, searchTerm, matchResult.matchPositions);
                } else {
                    article.style.display = 'none';
                }
            });
            
            titleSection.style.display = titleHasMatch ? 'block' : 'none';
        });
        
        // Sort results by relevance
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        return results;
    },
    
    /**
     * Check if article matches search criteria
     * @param {Element} article - Article element
     * @param {string} searchTerm - Search term
     * @param {string} filter - Current filter
     * @returns {Object} Match result with details
     */
    checkArticleMatch(article, searchTerm, filter) {
        const result = {
            matches: false,
            matchType: '',
            relevanceScore: 0,
            matchPositions: []
        };
        
        // Get article text content
        const titleElement = article.querySelector('h3');
        const contentElements = article.querySelectorAll('p, div:not(.punishment-value)');
        const punishmentElements = article.querySelectorAll('.punishment-value');
        
        const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
        const contentText = Array.from(contentElements).map(el => el.textContent).join(' ').toLowerCase();
        const punishmentText = Array.from(punishmentElements).map(el => el.textContent).join(' ').toLowerCase();
        const allText = `${titleText} ${contentText} ${punishmentText}`;
        
        // Apply filter-specific matching
        switch (filter) {
            case 'all':
                if (allText.includes(searchTerm)) {
                    result.matches = true;
                    result.matchType = 'all';
                    result.relevanceScore = this.calculateRelevanceScore(searchTerm, titleText, contentText, punishmentText);
                }
                break;
                
            case 'title':
            case 'code':
                if (titleText.includes(searchTerm)) {
                    result.matches = true;
                    result.matchType = 'title';
                    result.relevanceScore = this.calculateRelevanceScore(searchTerm, titleText, '', '');
                }
                break;
                
            case 'content':
                if (contentText.includes(searchTerm) || punishmentText.includes(searchTerm)) {
                    result.matches = true;
                    result.matchType = 'content';
                    result.relevanceScore = this.calculateRelevanceScore(searchTerm, '', contentText, punishmentText);
                }
                break;
        }
        
        // Find match positions for highlighting
        if (result.matches) {
            result.matchPositions = this.findMatchPositions(article, searchTerm);
        }
        
        return result;
    },
    
    /**
     * Calculate relevance score for search results
     * @param {string} searchTerm - Search term
     * @param {string} titleText - Title text
     * @param {string} contentText - Content text
     * @param {string} punishmentText - Punishment text
     * @returns {number} Relevance score
     */
    calculateRelevanceScore(searchTerm, titleText, contentText, punishmentText) {
        let score = 0;
        
        // Title matches are most relevant
        if (titleText.includes(searchTerm)) {
            score += 100;
            // Exact title match gets bonus
            if (titleText === searchTerm) score += 50;
            // Title starts with search term gets bonus
            if (titleText.startsWith(searchTerm)) score += 25;
        }
        
        // Content matches
        const contentMatches = (contentText.match(new RegExp(searchTerm, 'gi')) || []).length;
        score += contentMatches * 10;
        
        // Punishment/fine matches
        if (punishmentText.includes(searchTerm)) {
            score += 20;
        }
        
        // Shorter content with matches gets higher score
        if (contentText.length > 0) {
            score += Math.max(0, 50 - Math.floor(contentText.length / 100));
        }
        
        return score;
    },
    
    /**
     * Find match positions in article for highlighting
     * @param {Element} article - Article element
     * @param {string} searchTerm - Search term
     * @returns {Array} Array of match position objects
     */
    findMatchPositions(article, searchTerm) {
        const positions = [];
        const walker = document.createTreeWalker(
            article,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let textNode;
        while (textNode = walker.nextNode()) {
            const text = textNode.nodeValue.toLowerCase();
            let index = 0;
            
            while ((index = text.indexOf(searchTerm, index)) !== -1) {
                positions.push({
                    node: textNode,
                    start: index,
                    end: index + searchTerm.length
                });
                index += searchTerm.length;
            }
        }
        
        return positions;
    },
    
    /**
     * Display search results with enhanced UI
     * @param {Array} results - Search results
     * @param {string} searchTerm - Search term
     */
    displaySearchResults(results, searchTerm) {
        if (results.length === 0) {
            this.showNoResults(searchTerm);
        } else {
            this.hideNoResults();
            this.scrollToFirstResult();
        }
    },
    
    /**
     * Highlight search matches with enhanced visual feedback
     * @param {Element} element - Element to highlight matches in
     * @param {string} searchTerm - Term to highlight
     * @param {Array} matchPositions - Array of match positions
     */
    highlightMatches(element, searchTerm, matchPositions) {
        // Remove existing highlights
        this.removeExistingHighlights(element);
        
        // Apply new highlights
        matchPositions.forEach(position => {
            this.highlightTextNode(position.node, position.start, position.end);
        });
    },
    
    /**
     * Remove existing highlight spans
     * @param {Element} element - Element to remove highlights from
     */
    removeExistingHighlights(element) {
        const highlights = element.querySelectorAll('.search-highlight, .highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    },
    
    /**
     * Highlight specific text node
     * @param {Node} textNode - Text node to highlight
     * @param {number} start - Start position
     * @param {number} end - End position
     */
    highlightTextNode(textNode, start, end) {
        const text = textNode.nodeValue;
        const beforeText = text.substring(0, start);
        const highlightText = text.substring(start, end);
        const afterText = text.substring(end);
        
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'search-highlight';
        highlightSpan.textContent = highlightText;
        
        const fragment = document.createDocumentFragment();
        if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
        fragment.appendChild(highlightSpan);
        if (afterText) fragment.appendChild(document.createTextNode(afterText));
        
        textNode.parentNode.replaceChild(fragment, textNode);
    },
    
    /**
     * Show no results message
     * @param {string} searchTerm - Search term that yielded no results
     */
    showNoResults(searchTerm) {
        this.noResultsMessage.classList.remove('hidden');
        
        // Update no results message with search term
        const heading = this.noResultsMessage.querySelector('h3');
        const description = this.noResultsMessage.querySelector('p');
        
        if (heading) {
            const message = window.languageManager ? 
                window.languageManager.getText('noResults') : 
                'No Results Found';
            heading.textContent = message;
        }
        
        if (description) {
            description.textContent = `No results found for "${searchTerm}". Try different keywords or filters.`;
        }
    },
    
    /**
     * Hide no results message
     */
    hideNoResults() {
        this.noResultsMessage.classList.add('hidden');
    },
    
    /**
     * Reset content to original state
     */
    resetContent() {
        if (this.originalContentHTML) {
            this.contentContainer.innerHTML = this.originalContentHTML;
        }
        
        // Show all sections and articles
        this.contentContainer.querySelectorAll('section, article').forEach(el => {
            el.style.display = 'block';
        });
        
        this.hideNoResults();
        this.hideSearchStats();
    },
    
    /**
     * Update search statistics
     * @param {number} resultCount - Number of results
     * @param {string} searchTerm - Search term
     */
    updateSearchStats(resultCount, searchTerm) {
        if (resultCount > 0) {
            const message = `${resultCount} result${resultCount !== 1 ? 's' : ''} for "${searchTerm}"`;
            this.searchStatsElement.textContent = message;
            this.searchStatsElement.classList.remove('hidden');
        } else {
            this.hideSearchStats();
        }
    },
    
    /**
     * Hide search statistics
     */
    hideSearchStats() {
        this.searchStatsElement.classList.add('hidden');
    },
    
    /**
     * Show searching state
     */
    showSearchingState() {
        if (this.searchStatsElement) {
            this.searchStatsElement.textContent = 'Searching...';
            this.searchStatsElement.classList.remove('hidden');
        }
    },
    
    /**
     * Update filter UI
     */
    updateFilterUI() {
        document.querySelectorAll('.filter-option span').forEach(span => {
            span.classList.remove('bg-sky-500', 'text-white');
            span.classList.add('bg-gray-800', 'text-gray-300');
        });
        
        const selectedFilter = document.querySelector(`input[name="search-filter"][value="${this.currentFilter}"]`);
        if (selectedFilter) {
            const span = selectedFilter.nextElementSibling;
            span.classList.remove('bg-gray-800', 'text-gray-300');
            span.classList.add('bg-sky-500', 'text-white');
        }
    },
    
    /**
     * Navigate to first search result
     */
    navigateToFirstResult() {
        if (this.searchResults.length > 0) {
            const firstResult = this.searchResults[0].element;
            firstResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add temporary highlight
            firstResult.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';
            setTimeout(() => {
                firstResult.style.backgroundColor = '';
            }, 2000);
        }
    },
    
    /**
     * Load search history from localStorage
     * @returns {Array} Search history
     */
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('searchHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('Failed to load search history:', error);
            return [];
        }
    },
    
    /**
     * Save search history to localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    },
    
    /**
     * Add search term to history
     * @param {string} searchTerm - Search term to add
     */
    addToSearchHistory(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return;
        
        // Remove existing occurrence
        this.searchHistory = this.searchHistory.filter(term => term !== searchTerm);
        
        // Add to beginning
        this.searchHistory.unshift(searchTerm);
        
        // Keep only last 20 searches
        this.searchHistory = this.searchHistory.slice(0, 20);
        
        this.saveSearchHistory();
    },
    
    /**
     * Get search suggestions based on input
     * @param {string} input - Current input
     * @returns {Array} Array of suggestions
     */
    getSearchSuggestions(input) {
        if (!input || input.length < 2) return [];
        
        const suggestions = [];
        const inputLower = input.toLowerCase();
        
        // Add matching history items
        this.searchHistory.forEach(term => {
            if (term.toLowerCase().includes(inputLower)) {
                suggestions.push({
                    text: term,
                    type: 'history'
                });
            }
        });
        
        // Add common legal terms (could be expanded)
        const commonTerms = [
            'murder', 'theft', 'assault', 'robbery', 'burglary', 'fraud',
            'trafficking', 'possession', 'violence', 'property', 'firearm',
            'drug', 'felony', 'misdemeanor', 'fine', 'prison', 'jail',
            'pembunuhan', 'pencurian', 'perampokan', 'penipuan', 'narkoba',
            'kekerasan', 'senjata', 'harta', 'denda', 'penjara'
        ];
        
        commonTerms.forEach(term => {
            if (term.toLowerCase().includes(inputLower) && 
                !suggestions.some(s => s.text === term)) {
                suggestions.push({
                    text: term,
                    type: 'suggestion'
                });
            }
        });
        
        return suggestions.slice(0, 8); // Limit to 8 suggestions
    },
    
    /**
     * Update search suggestions
     */
    updateSearchSuggestions() {
        const input = this.searchInput.value.trim();
        const suggestions = this.getSearchSuggestions(input);
        
        if (suggestions.length > 0 && input.length >= 2) {
            this.renderSearchSuggestions(suggestions);
        } else {
            this.hideSearchSuggestions();
        }
    },
    
    /**
     * Render search suggestions
     * @param {Array} suggestions - Array of suggestions
     */
    renderSearchSuggestions(suggestions) {
        let html = '';
        
        suggestions.forEach(suggestion => {
            const icon = suggestion.type === 'history' ? 
                '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' :
                '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';
            
            html += `
                <div class="suggestion-item flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm" data-suggestion="${suggestion.text}">
                    ${icon}
                    <span class="flex-1">${suggestion.text}</span>
                    ${suggestion.type === 'history' ? '<span class="text-xs text-gray-500">Recent</span>' : ''}
                </div>
            `;
        });
        
        this.suggestionsContainer.innerHTML = html;
        this.suggestionsContainer.classList.remove('hidden');
        
        // Add click handlers
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                this.searchInput.value = suggestion;
                this.performSearch(true);
                this.hideSearchSuggestions();
                this.addToSearchHistory(suggestion);
            });
        });
    },
    
    /**
     * Show search suggestions
     */
    showSearchSuggestions() {
        const input = this.searchInput.value.trim();
        if (input.length >= 2) {
            this.updateSearchSuggestions();
        }
    },
    
    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        this.suggestionsContainer.classList.add('hidden');
    },
    
    /**
     * Save search preferences
     */
    saveSearchPreferences() {
        try {
            const preferences = {
                filter: this.currentFilter,
                history: this.searchHistory
            };
            localStorage.setItem('searchPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save search preferences:', error);
        }
    },
    
    /**
     * Get current search state
     * @returns {Object} Current search state
     */
    getSearchState() {
        return {
            searchTerm: this.currentSearchTerm,
            filter: this.currentFilter,
            resultCount: this.searchResults.length,
            isSearching: this.isSearching
        };
    },
    
    /**
     * Export search results
     * @returns {Array} Search results data
     */
    exportSearchResults() {
        return this.searchResults.map(result => ({
            id: result.element.id,
            title: result.element.querySelector('h3')?.textContent || '',
            content: result.element.textContent,
            matchType: result.matchType,
            relevanceScore: result.relevanceScore
        }));
    },
    
    /**
     * Debounce function to limit how often a function is called
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    searchManager.init();
    window.searchManager = searchManager;
});

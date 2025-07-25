/**
 * Search Manager
 * Handles search functionality with filtering and highlighting
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
        
        // Store original content for reset
        this.originalContentHTML = '';
        
        // Add event listeners
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.performSearch();
            this.toggleClearButton();
        }, 300));
        
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.performSearch();
            this.toggleClearButton();
            this.searchInput.focus();
        });
        
        this.filterOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.performSearch();
                
                // Update filter UI
                document.querySelectorAll('.filter-option span').forEach(span => {
                    span.classList.remove('bg-sky-500', 'text-white');
                    span.classList.add('bg-gray-800', 'text-gray-300');
                });
                
                const selectedFilter = document.querySelector('input[name="search-filter"]:checked');
                if (selectedFilter) {
                    const span = selectedFilter.nextElementSibling;
                    span.classList.remove('bg-gray-800', 'text-gray-300');
                    span.classList.add('bg-sky-500', 'text-white');
                }
            });
        });
        
        console.log('Search manager initialized');
    },
    
    /**
     * Set original content HTML for reset
     * @param {string} html - Original HTML content
     */
    setOriginalContent(html) {
        this.originalContentHTML = html;
    },
    
    /**
     * Toggle clear button visibility based on search input
     */
    toggleClearButton() {
        if (this.searchInput.value.trim() !== '') {
            this.clearSearchBtn.classList.remove('hidden');
        } else {
            this.clearSearchBtn.classList.add('hidden');
        }
    },
    
    /**
     * Perform search based on input and selected filter
     */
    performSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        // Reset content if search is empty
        if (searchTerm === '') {
            if (this.originalContentHTML) {
                this.contentContainer.innerHTML = this.originalContentHTML;
            }
            this.contentContainer.querySelectorAll('section, article').forEach(el => el.style.display = 'block');
            this.noResultsMessage.classList.add('hidden');
            this.searchStatsElement.classList.add('hidden');
            return;
        }
        
        // Reset content for new search
        if (this.originalContentHTML) {
            this.contentContainer.innerHTML = this.originalContentHTML;
        }
        
        // Get selected filter
        const selectedFilter = document.querySelector('input[name="search-filter"]:checked').value;
        
        let resultsFound = 0;
        const allTitles = this.contentContainer.querySelectorAll('.penal-code-title');
        
        allTitles.forEach(titleSection => {
            let titleHasMatch = false;
            const articlesInSection = titleSection.querySelectorAll('.penal-code-article');
            
            articlesInSection.forEach(article => {
                let shouldShow = false;
                
                // Apply filter
                if (selectedFilter === 'all') {
                    shouldShow = article.innerText.toLowerCase().includes(searchTerm);
                } else if (selectedFilter === 'title') {
                    const titleElement = article.querySelector('h3');
                    shouldShow = titleElement && titleElement.innerText.toLowerCase().includes(searchTerm);
                } else if (selectedFilter === 'code') {
                    const codeElement = article.querySelector('h3');
                    shouldShow = codeElement && codeElement.innerText.toLowerCase().includes(searchTerm);
                } else if (selectedFilter === 'content') {
                    const contentElements = article.querySelectorAll('p:not(.punishment-value)');
                    contentElements.forEach(el => {
                        if (el.innerText.toLowerCase().includes(searchTerm)) {
                            shouldShow = true;
                        }
                    });
                }
                
                if (shouldShow) {
                    article.style.display = 'block';
                    titleHasMatch = true;
                    resultsFound++;
                    
                    // Highlight matches
                    this.highlightMatches(article, searchTerm);
                } else {
                    article.style.display = 'none';
                }
            });
            
            titleSection.style.display = titleHasMatch ? 'block' : 'none';
        });
        
        // Show/hide no results message
        if (resultsFound === 0) {
            this.noResultsMessage.classList.remove('hidden');
            this.searchStatsElement.classList.add('hidden');
        } else {
            this.noResultsMessage.classList.add('hidden');
            
            // Update search stats
            const statsText = (typeof labels !== 'undefined' && labels[currentLang]) ? 
                `${resultsFound} results` : 
                `${resultsFound} results`;
            
            this.searchStatsElement.textContent = statsText;
            this.searchStatsElement.classList.remove('hidden');
        }
    },
    
    /**
     * Highlight search matches in an element
     * @param {Element} element - Element to highlight matches in
     * @param {string} searchTerm - Term to highlight
     */
    highlightMatches(element, searchTerm) {
        const textNodes = this.getTextNodes(element);
        
        textNodes.forEach(node => {
            const text = node.nodeValue;
            const lowerText = text.toLowerCase();
            let startIndex = 0;
            let index;
            
            // Find all instances of the search term
            while ((index = lowerText.indexOf(searchTerm, startIndex)) > -1) {
                // Split the text node at the match
                const matchedText = text.substring(index, index + searchTerm.length);
                const beforeMatch = text.substring(0, index);
                const afterMatch = text.substring(index + searchTerm.length);
                
                // Create a span for the highlighted text
                const highlightSpan = document.createElement('span');
                highlightSpan.className = 'highlight';
                highlightSpan.textContent = matchedText;
                
                // Replace the text node with the highlighted version
                const fragment = document.createDocumentFragment();
                fragment.appendChild(document.createTextNode(beforeMatch));
                fragment.appendChild(highlightSpan);
                
                // Create a new text node for the remaining text
                const remainingText = document.createTextNode(afterMatch);
                fragment.appendChild(remainingText);
                
                // Replace the original node with our fragment
                node.parentNode.replaceChild(fragment, node);
                
                // Update for next iteration
                node = remainingText;
                startIndex = 0;
                break; // We've modified the DOM, so we need to break and get new text nodes
            }
        });
    },
    
    /**
     * Get all text nodes within an element
     * @param {Element} element - Element to get text nodes from
     * @returns {Array} Array of text nodes
     */
    getTextNodes(element) {
        const textNodes = [];
        const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        
        let node;
        while (node = walk.nextNode()) {
            // Skip nodes in highlight spans to avoid re-highlighting
            if (node.parentNode.className !== 'highlight') {
                textNodes.push(node);
            }
        }
        
        return textNodes;
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
});